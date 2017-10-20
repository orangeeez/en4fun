import { Component, ViewChildren } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AddCollectionPage } from "../add-collection/add-collection";
import { WordPage } from "../word/word";
import { ReadingPage } from "../reading/reading";
import { VideoPage } from "../video/video";
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { GrammarPage } from "../grammar/grammar";
import { WordTrainingPage } from "../word-training/word-training";
import { ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-collection',
  templateUrl: 'collection.html',
})
export class CollectionPage {
  @ViewChildren('slidings') slidings;

  user: firebase.User;
  moreSheet: any;
  type: string;
  studentKey: any;
  collection: any;
  words: FirebaseListObservable<any[]>;
  readings: any[];
  videos: FirebaseListObservable<any[]>;
  grammars: FirebaseListObservable<any[]>;
  checkedKeys: string[];
  grammarsCount: number;
  wordsCount: number;
  text: string[];
  segment: string = 'trainings';
  trainings: any;
  selectedTrainingKeys: string[];
  isCountLabelEnabled: boolean;
  isEditChecked: boolean;

  constructor(
    public platfrom: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public youtubePlayer: YoutubeVideoPlayer,
    public toastCtrl: ToastController) {
      this.readings = [];
      this.user = this.afAuth.auth.currentUser;
      this.type = this.navParams.get('type');
      this.studentKey = this.navParams.get('studentKey');
      this.collection = this.navParams.get('collection');

      switch (this.type) {
        case 'vocabulary' :
          this.checkedKeys = [];   
          this.words = this.afDB.list(`/wordCollections/${this.collection.$key}`);          
          this.trainings = [{ name: 'Word - translation', imageURL: 'assets/images/translator.png', type: 'wordtranslation', left: 0 },
                            { name: 'Translation - word', imageURL: 'assets/images/translator-reverse.png', type: 'translationword', left: 0 },
                            { name: 'Word constructor', imageURL: 'assets/images/insertion.png', type: 'constructor', left: 0 }];

          // GET ALL GRAMMAR IN CERTAIN COLLECTION
          this.afDB.database.ref(`/wordCollections/${this.collection.$key}`).once('value')
            .then(wordKeys => {
              this.wordsCount = Object.keys(wordKeys.val()).length;

              // COUNT LEFT SENTENCES FOR EACH TRAINING  
              for (let training of this.trainings)
              this.afDB.list(`/learned/${this.user['enemail']}/vocabulary/collections/${this.collection.$key}/${training.type}`)
                .subscribe(wordKeys => {
                  let learned = wordKeys.map(key => key.$value).filter(value => value == true);
                  training.left = this.wordsCount - learned.length;
                });
            });
        break;
        case 'reading' :
          this.afDB.object(`readingCollections/${this.collection.$key}`)
            .subscribe(readingCollection => {
              this.readings = [];
              if (readingCollection.$exists())
                for (let readingKey in readingCollection) {
                  this.afDB.object(`readings/${readingKey}`)
                    .subscribe(reading => {
                      this.readings.push(reading);
                    });
                  }
           });
        break;
        case 'video' :
          this.videos = this.afDB.list(`videoCollections/${this.collection.$key}`);
        break;
        case 'grammar' :
          this.checkedKeys = [];
          this.grammars = this.afDB.list(`/grammarCollections/${this.collection.$key}`);
          this.trainings = [{ name: 'sentence constructor', imageURL: 'assets/images/constructor.png', type: 'constructor', left: 0 },
                            { name: 'sentence insertion', imageURL: 'assets/images/insertion.png', type: 'insertion', left: 0 }];
          
          // GET ALL GRAMMAR IN CERTAIN COLLECTION
          this.afDB.database.ref(`/grammarCollections/${this.collection.$key}`).once('value')
            .then(grammarKeys => {
              this.grammarsCount = Object.keys(grammarKeys.val()).length;

              // COUNT LEFT SENTENCES FOR EACH TRAINING  
              for (let training of this.trainings)
              this.afDB.list(`/learned/${this.user['enemail']}/grammar/collections/${this.collection.$key}/${training.type}`)
                .subscribe(grammarKeys => {
                  let learned = grammarKeys.map(key => key.$value).filter(value => value == true);
                  training.left = this.grammarsCount - learned.length;
                });
            });          
        break;
       }
  }

  onReadingClick(reading) {
    this.navCtrl.push(ReadingPage, {
      reading: reading
    });
  }

  onWordClick(word) {
    this.navCtrl.push(WordPage, {
      word: word,
      words: this.words,
      collectionKey: this.collection.$key
    });
  }

  onRemoveWordClick(word: any) {
    // this.words = [];
    this.afDB.database.ref(`/wordCollections/other`).child(word.$key).set(true);
    this.afDB.database.ref(`/wordCollections/${this.collection.$key}/${word.$key}`).remove();
    this.afDB.database.ref(`/wordKeys/${word.$key}`).set({ used: false });
  }

  onPlayVideoClick(id: string) {
    this.youtubePlayer.openVideo(id);
  }

  onTitleVideoClick(video) {
    this.navCtrl.push(VideoPage, {
      video: video
    });
  }

  onMoreClick() {
    let buttons = [];
    let editbButton = {
      text: 'Edit',
      handler: () => {
        this.onEditClick();
      }
    }; 
    let removeButton = {
      text: 'Remove',
        role: 'destructive',
        handler: () => {
          this.onRemoveClick();
        }
    };

    if (!this.studentKey)
      buttons.push(editbButton);
    buttons.push(removeButton);

    this.moreSheet = this.actionSheetCtrl.create({
      title: 'Collection',
      buttons: buttons
    });
    this.moreSheet.present();
  }

  onEditClick() {
    this.navCtrl.push(AddCollectionPage, {
      type: this.type,
      action: 'edit',
      collectionKey: this.collection.$key
    });
  };

  onGrammarClick(grammar) {
    this.navCtrl.push(GrammarPage, {
      type: 'content',
      grammar: grammar
    });
  }

  onTrainingClick(training, type) {
    if (training.left == 0) {
      let toast = this.toastCtrl.create({
        message: 'Please add material from content',
        duration: 3000
      });
      toast.present();

      return;
    }

    switch (type) {
      case 'grammar':
        this.navCtrl.push(GrammarPage, {
          type: training.type,
          collection: this.collection.$key
        });
      break;
      case 'vocabulary': 
        this.navCtrl.push(WordTrainingPage, {
          training: training,
          collection: this.collection.$key
        });
      break;
    }
  }

  onInstanceCheckClick(instance, checked) {
    if (checked) {
      instance.checked = checked;
      this.checkedKeys.push(instance.$key);
    }
    else {
      instance.checked = checked;      
      this.checkedKeys = this.checkedKeys.filter(key => key !== instance.$key);
    }
  }

  onEditCheckboxClick() {
    this.checkedKeys = [];
    this.isEditChecked = true;
    for (let slide of this.slidings.toArray()) {
      slide.setElementClass("active-sliding", true);
      slide.setElementClass("active-slide", true);
      slide.setElementClass("active-options-left", true);
      if (this.platfrom.is('ios'))
        slide.item.setElementStyle("transform", "translate3d(22px, 0px, 0px)");      
      else
        slide.item.setElementStyle("transform", "translate3d(16px, 0px, 0px)");
    }
  }

  onCloseCheckboxClick() {
    this.isEditChecked = false;

    for (let slide of this.slidings.toArray()) {
      slide.close()
      slide.setElementClass("active-sliding", false);
      slide.setElementClass("active-slide", false);
      slide.setElementClass("active-options-left", false);
      slide._elementRef.nativeElement.value['checked'] = false;
    }
  }

  onSelectOkClick() {
    for (let trainingKey of this.selectedTrainingKeys)
      for (let checkedKey of this.checkedKeys)
        this.afDB.database.ref(`/learned/${this.user['enemail']}/${this.type}/collections/${this.collection.$key}/${trainingKey}/${checkedKey}`).set(false);
        this.selectedTrainingKeys.length = 0;
        this.checkedKeys.length = 0;
        this.onCloseCheckboxClick();
  }

  onEditCheckAllClick(checked) {
    for (let slide of this.slidings.toArray())
      if (checked) {
        // IF GRAMMAR KEYS CONTAIN NEW CHECKED GRAMMARS
        if (this.checkedKeys.filter(key => key == slide._elementRef.nativeElement.value.$key).length == 0) {
          this.checkedKeys.push(slide._elementRef.nativeElement.value.$key);
          slide._elementRef.nativeElement.value['checked'] = true;
        }
      }
      else {
        this.checkedKeys = this.checkedKeys.filter(key => key !== slide._elementRef.nativeElement.value.$key);        
        slide._elementRef.nativeElement.value['checked'] = false;
      }
  }

  onGetWordQuarterColor(word, num: number) {
    switch (this.trainings.length) {
      case 1: 
      break;
      case 2:
      break;
      case 3:
        if (num == 1) {
          if (word.constructorLearned) 
            return '#488aff';
          else 
            return '#f4f4f4';
        }

        else if (num == 2) {
          if (word.wordtranslationLearned) 
            return '#32db64';
          else 
            return '#f4f4f4';
        }

        else if (num == 3 || 
                 num == 4) {
          if (word.translationwordLearned) 
            return '#f53d3d';
          else 
            return '#f4f4f4';
        }
      break;
    }
  }

  onGetGrammarQuarterColor(grammar, num: number) {
    switch (this.trainings.length) {
      case 1: 
        if (num == 1 ||
            num == 2 || 
            num == 3 || 
            num == 4) {
          
          if (grammar.constructorLearned)
            if (grammar.constructorLearned)
              return '#488aff';
            else 
              return '#f4f4f4';

          else if (grammar.insertionLearned)
            if (grammar.insertionLearned)
              return '#32db64';
            else
              return '#f4f4f4';
        }
      break;
      case 2:
        if (num == 1 ||
            num == 2) {
          if (grammar.constructorLearned)
            return '#488aff';
          else
            return '#f4f4f4';
          }
          
        else if (num == 3 ||
                 num == 4) {
          if (grammar.insertionLearned)
            return '#32db64 ';
          else
            return '#f4f4f4';
        }
      break;
    }
  }

  onRemoveGrammarClick(collection, grammar) {
    this.afDB.database.ref(`/grammarKeys/${grammar.$key}`).remove();
    this.afDB.database.ref(`/grammars/${grammar.$key}`).remove();
    this.afDB.database.ref(`/grammarCollections/${collection.key}/${grammar.$key}`).remove();
  }

  onRemoveClick() {
    let confirm = this.alertCtrl.create({
      title: 'Remove Collection',
      message: `Do you want to remove ${this.collection.$key} collection?`,
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: () => {
            if (this.studentKey) {
              this.afDB.database.ref(`/students/${this.studentKey.key}/collections/${this.type}/${this.collection.$key}`).remove();
              this.navCtrl.pop();
              return;
            }
            
            // Remove collection from collection keys
            this.afDB.database.ref(`/collectionKeys/${this.type}/${this.collection.$key}`).remove();

            // Remove collection from collections 
            this.afDB.database.ref(`/collections/${this.type}/${this.collection.$key}`).remove();

            switch (this.type) {
              case 'grammar' :
                this.afDB.database.ref(`/grammarCollections/${this.collection.$key}`).remove();
              break;

              case 'vocabulary' :
                // Unused words used in collection
                this.afDB.database.ref(`/wordCollections/${this.collection.$key}`).remove();
                this.words.forEach(words => {
                  for (let word of words)
                    this.afDB.database.ref(`/wordKeys/${word.$key}`).update({ used: false });
                });
              break;

              case 'video' :
                this.afDB.database.ref(`/videoCollections/${this.collection.$key}`).remove();              
              break;

              case 'reading' :
                this.afDB.database.ref(`/readingCollections/${this.collection.$key}`).remove();              
              break;
            }

            // Remove collection from students
            this.afDB.list('/studentKeys')
              .subscribe(studentKeys => {
                studentKeys.forEach(studentKey => {
                  this.afDB.database.ref(`/students/${studentKey.$key}/collections/${this.type}/${this.collection.$key}`).remove();
                });
              });

            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }
}
