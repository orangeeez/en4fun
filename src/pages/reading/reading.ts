import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { ReadingTrainingPage } from "../reading-training/reading-training";
import { WordsServiceProvider } from "../../providers/words-service/words-service";
import * as firebase from 'firebase/app'

@Component({
  selector: 'page-reading',
  templateUrl: 'reading.html',
})
export class ReadingPage {
  user: firebase.User;
  studentKey: string;
  collection: string;
  reading: any;
  items: string[];
  translatedWords: any[];
  selectedWord: any;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public wordService: WordsServiceProvider) {
      this.translatedWords = [];
      this.user = this.afAuth.auth.currentUser;  
      this.reading = this.navParams.get('reading');
      this.collection = this.navParams.get('collection');
      this.studentKey = this.navParams.get('studentKey');

      this.afDB.database.ref(`readingTexts/${this.reading.$key}`).once('value')
        .then(text => this.items = text.val().match(/<p>(.*?)<\/p>/g).map(function(value) {
          value = value.replace(/<\/?p>|<\/?p>/g, '');  
          return value;
       }));
    } 

  onTapWord(spanWord: HTMLSpanElement) {
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

  onTrainingClick() {
    this.navCtrl.push(ReadingTrainingPage, {
      collection: this.collection,
      reading: this.reading,
      studentKey: this.studentKey
    })
  }

  translateCallback(translatedWords, word) {
    if (word.translations) 
      translatedWords.push.apply(translatedWords, word.translations[0].translations);
  }
}
