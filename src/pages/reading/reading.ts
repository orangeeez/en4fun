import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { WordsServiceProvider } from "../../providers/words-service/words-service";
import * as firebase from 'firebase/app'

@Component({
  selector: 'page-reading',
  templateUrl: 'reading.html',
})
export class ReadingPage {
  user: firebase.User;
  reading: any;
  paragraphs: string[];
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

      this.afDB.database.ref(`readingTexts/${this.reading.$key}`).once('value')
        .then(text => this.paragraphs = text.val().split("<p>"));
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