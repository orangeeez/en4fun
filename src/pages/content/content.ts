import { Component } from '@angular/core';
import { TitleCasePipe } from "@angular/common";
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AddWordPage } from "../add-word/add-word";
import { SpaceCapitalLettersPipe } from "../../pipes/space-capital-letters/space-capital-letters";
import { ReadingPage } from "../reading/reading";
import { AddReadingPage } from "../add-reading/add-reading";
import { AddVideosPage } from "../add-videos/add-videos";
import { EditVideoPage } from "../edit-video/edit-video";
import { VideoPage } from "../video/video";
import { AddGrammarPage } from "../add-grammar/add-grammar";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
})
export class ContentPage {
  user: firebase.User;
  collectionTypes: FirebaseListObservable<any[]>;
  wordCollections: FirebaseListObservable<any[]>;
  readingCollections: FirebaseListObservable<any[]>;
  videoCollections: FirebaseListObservable<any[]>;
  grammarCollections: FirebaseListObservable<any[]>;  
  collectionType: string = 'video';
  words: any[] = [];
  search: string = ""
  collection: string = "";
  moreSheet: any;  

  constructor(
    public platform: Platform,
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public spaceCapitalLettersPipe: SpaceCapitalLettersPipe,
    public titleCasePipe: TitleCasePipe,
    public youtubePlayer: YoutubeVideoPlayer) {
      this.user = this.afAuth.auth.currentUser;
      this.collectionTypes = this.afDB.list(`/collectionTypes`, { preserveSnapshot: true })
      this.onSelectCollectionType();
    }

    onAddClick() {
      switch (this.collectionType) {
        case 'vocabulary' :
          this.navCtrl.push(AddWordPage);
          break;
        case 'reading' :
          this.navCtrl.push(AddReadingPage);
          break;
        case 'video' : 
          this.navCtrl.push(AddVideosPage);
          break;
        case 'grammar' :
          this.navCtrl.push(AddGrammarPage);
        break;
      }
    }

    onRemoveSelectClick() {
      this.collection = "";
    }

    onRemoveButtonClick(wordCollection, word) {
      this.afDB.database.ref(`/wordKeys/${word.$key}`).remove();
      this.afDB.database.ref(`/words/${word.$key}`).remove();
      this.afDB.database.ref(`/wordCollections/${wordCollection.key}/${word.$key}`).remove();
    }

    onSelectCollectionType() {
      switch (this.collectionType) {
        case 'vocabulary' :
          this.wordCollections = this.afDB.list(`/wordCollections`, { preserveSnapshot: true });      
          break;
        case 'reading' : 
          this.readingCollections = this.afDB.list(`/readingCollections`, { preserveSnapshot: true });
          break;
        case 'video' :
          this.videoCollections = this.afDB.list(`/videoCollections`, { preserveSnapshot: true });
          break;
        case 'grammar' : 
          this.grammarCollections = this.afDB.list(`/grammarCollections`, { preserveSnapshot: true });
          break;
      }
    }

    // READING HANDLErS
    onReadingClick(reading, collectionKey) {
      let buttons = []
      let openButton = {
        text: 'Open',
        handler: () => {
          this.onOpenReadingClick(reading);
        }
      }; 
      let editbButton = {
        text: 'Edit',
        handler: () => {
          this.onEditReadingClick(reading, collectionKey);
        }
      }; 
      let removeButton = {
        text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.onRemoveReadingClick(reading, collectionKey);
          }
      };

      buttons.push(openButton, editbButton, removeButton);

      this.moreSheet = this.actionSheetCtrl.create({
        title: this.titleCasePipe.transform(this.spaceCapitalLettersPipe.transform(reading.$key)),
        buttons: buttons
      });
      this.moreSheet.present();
    }

    onOpenReadingClick(reading) {
      this.navCtrl.push(ReadingPage, {
        reading: reading
      });
    }

    onEditReadingClick(reading, collectionKey) {
      this.navCtrl.push(AddReadingPage, {
        reading: reading,
        collectionKey: collectionKey
      });
    }

    onRemoveReadingClick(reading, collectionKey) {
      let confirm = this.alertCtrl.create({
        title: 'Remove Text',
        message: `Do you want to remove "${this.titleCasePipe.transform(this.spaceCapitalLettersPipe.transform(reading.$key))}"`,
        buttons: [
          {
            text: 'No'
          },
          {
            text: 'Yes',
            handler: () => {
              this.afDB.database.ref(`/readingCollections/${collectionKey}/${reading.$key}`).remove();
              this.afDB.database.ref(`/readings/${reading.$key}`).remove();
              this.afDB.database.ref(`/readingTexts/${reading.$key}`).remove();
              this.afDB.database.ref(`/readingKeys/${reading.$key}`).remove();              
            }
          }
        ]
      });
      confirm.present();
    }

    onPlayVideoClick(id: string) {
      this.youtubePlayer.openVideo(id);
    }

    // VIDEO HANDLErS
    onVideoClick(video, collectionKey, index) {
      let buttons = []
      let openbButton = {
        text: 'Open',
        handler: () => {
          this.onOpenVideoClick(video);
        }
      }; 
      let editbButton = {
        text: 'Edit',
        handler: () => {
          this.onEditVideoClick(video, collectionKey);
        }
      }; 
      let removeButton = {
        text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.onRemoveVideoClick(video, collectionKey);
          }
      };

      buttons.push(openbButton, editbButton, removeButton);

      this.moreSheet = this.actionSheetCtrl.create({
        title: this.titleCasePipe.transform(this.spaceCapitalLettersPipe.transform(video.title)),
        buttons: buttons
      });
      this.moreSheet.present();
    }

    onOpenVideoClick(video) {
      this.navCtrl.push(VideoPage, {
        video: video
      });
    }

    onEditVideoClick(video, collectionKey) {
      this.navCtrl.push(EditVideoPage, {
        collectionKey: collectionKey ? collectionKey : 'other',
        videoKey: video.id,
        video: video
      });
    }

    onRemoveVideoClick(video, collectionKey) {
      let confirm = this.alertCtrl.create({
        title: 'Remove Video',
        message: `Do you want to remove "${video.title}"`,
        buttons: [
          {
            text: 'No'
          },
          {
            text: 'Yes',
            handler: () => {
              let ref = this.afDB.list(`/videoCollections/${collectionKey}`, { 
                query : { 
                  orderByValue: true,
                  equalTo: video.id 
                }
              });
              ref.subscribe(index => { 
                this.afDB.database.ref(`/videoCollections/${collectionKey}/${index[0].$key}`).remove();
                ref.$ref.off();
              });
            }
          }
        ]
      });
      confirm.present();
    }

    onEditGrammarClick(collection, grammar) {
      this.navCtrl.push(AddGrammarPage, {
        edit: true,
        grammar: grammar,
        collection: collection
      });
    }

    onRemoveGrammarClick(collection, grammar) {
      this.afDB.database.ref(`/grammarKeys/${grammar.$key}`).remove();
      this.afDB.database.ref(`/grammars/${grammar.$key}`).remove();
      this.afDB.database.ref(`/grammarCollections/${collection.key}/${grammar.$key}`).remove();
    }
}
