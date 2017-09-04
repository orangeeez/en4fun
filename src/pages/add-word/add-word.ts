import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { WordsServiceProvider } from "../../providers/words-service/words-service";
import { Word } from "../../classes/word";
import { Utils } from "../../classes/utils";

@Component({
  selector: 'page-add-word',
  templateUrl: 'add-word.html',
})
export class AddWordPage {
  word: Word;
  wordKey: string;
  imageURL: string = 'https://firebasestorage.googleapis.com/v0/b/en4fun-795ce.appspot.com/o/images%2Fcollections%2Fadd.jpg?alt=media&token=84ac828e-5ca3-4f6e-9d02-058c7a88b608';
  collectionKeys: FirebaseListObservable<any[]>
  selectedCollection: any;
  pronunciation: string;

  categories = {
    translations: [],
    definitions: [],
    synonyms: [],
    examples: [],
    parts: [],
    pronunciation: ''
  };

  categoryKeys = Object.keys(this.categories);

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public wordsService: WordsServiceProvider) {
      this.word = new Word();      
      this.collectionKeys = this.afDB.list('/collectionKeys/vocabulary');
    }

    onGetWordClick() {
      this.wordsService.getWord(this.wordKey)
        .subscribe(word => {
          Utils.ParseWordsApiWord(this.categories, word);
          this.wordsService.translateWord(this.wordKey, this.translateCallback.bind(this, this.categories));
        });
    }

    onCheckmarkClick() {
      this.word.imageURL = this.imageURL;
      this.word.pronunciation = this.categories.pronunciation;

      if (this.selectedCollection)
        this.afDB.database.ref(`/wordCollections/${this.selectedCollection.$key}/${this.wordKey}`).set(true);
      else
        this.afDB.database.ref(`/wordCollections/other/${this.wordKey}`).set(true);
        

      this.afDB.database.ref(`/words/${this.wordKey}`).set(this.word);
      this.afDB.database.ref(`/wordKeys/${this.wordKey}`).set({ used: this.selectedCollection ? true : false });

      this.navCtrl.pop();
    }

    onRadioButtonClick(category: string, value: string, checked: boolean) {
      if (checked) {
        let index = this.categories[category].indexOf(value);
        this.word[category].push(this.categories[category][index]);
      }
      else {
        let index = this.word[category].indexOf(value);
        this.word[category].splice(index, 1);
      }
    }

    onAddImageClick() {
      this.word.imageURL = this.imageURL;
    }

    translateCallback(word, categories) {
      Utils.ParseGoogleTranslateWord(word, categories);
    }
}