import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AddCollectionPage } from "../add-collection/add-collection";
import { HomePage } from "../home/home";
import { WordPage } from "../word/word";
import { WordsServiceProvider } from "../../providers/words-service/words-service";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-collection',
  templateUrl: 'collection.html',
})
export class CollectionPage {
  user: firebase.User;
  moreSheet: any;
  type: string;
  studentKey: any;
  collection: any;
  words: any[];
  translatedWords: any[];
  paragraphs: string[];
  text: string[];
  selectedWord: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public wordService: WordsServiceProvider) {
      this.words = [];
      this.translatedWords = [];
      this.user = this.afAuth.auth.currentUser;
      this.type = this.navParams.get('type');
      this.studentKey = this.navParams.get('studentKey');
      this.collection = this.navParams.get('collection');

      switch (this.type) {
        case 'vocabulary' :
          this.afDB.object(`wordCollections/${this.collection.$key}`)
            .subscribe(wordCollection => {
              this.words = [];
              if (wordCollection.$exists())
                for (let wordKey in wordCollection)
                  this.afDB.object(`words/${wordKey}`)
                    .subscribe(word => {
                      this.words.push(word);
                    });
            });
          break;
        case 'reading' :
            let isTag;
            this.paragraphs = this.collection.text.split("<p>");      
            break;
       }
  }

  onWordClick(word) {
    this.navCtrl.push(WordPage, {
      word: word,
      words: this.words
    });
  }

  onRemoveWordClick(word: any) {
    this.words = [];
    this.afDB.database.ref(`/wordCollections/other`).child(word.$key).set(true);
    this.afDB.database.ref(`/wordCollections/${this.collection.$key}/${word.$key}`).remove();
    this.afDB.database.ref(`/wordKeys/${word.$key}`).set({ used: false });
  }

  onMoreClick() {
    let buttons = [];
    let editbButton = {
      text: 'Edit',
      handler: () => {
        this.onEditClick();
      }
    }; 
    let removeButton = 
      {
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

            // Unused words used in collection
            for (let word of this.words) {
              this.afDB.database.ref(`/wordCollections/${this.collection.$key}`).remove();
              this.afDB.database.ref(`/wordKeys/${word.$key}`).update({ used: false });
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

  onTapWord(spanWord) {
    if (!this.selectedWord) {
      this.selectedWord = spanWord;
      this.selectedWord.style.color = '#488aff';
      this.wordService.translateWord(spanWord.innerHTML, this.translateCallback.bind(this, this.translatedWords));
    }
    else if (this.selectedWord == spanWord) {
      this.selectedWord.style.color = 'black';
      this.selectedWord = undefined;
      this.translatedWords = [];
    }
    else {
      this.selectedWord.style.color = 'black';
      this.selectedWord = undefined;
      this.translatedWords = [];
      this.onTapWord(spanWord);
    }
  }

  translateCallback(translatedWords, word) {
    if (word.translations) 
      translatedWords.push.apply(translatedWords, word.translations[0].translations);
  }
}
