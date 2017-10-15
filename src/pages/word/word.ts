import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { FirebaseListObservable } from "angularfire2/database";
import { WordsByCollectionPipe } from "../../pipes/words-by-collection/words-by-collection";

@Component({
  selector: 'page-word',
  templateUrl: 'word.html',
})
export class WordPage {
  @ViewChild(Slides) slides: Slides;
  word: any;
  wordsList: FirebaseListObservable<any[]>;
  words: any[];
  collectionKey: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public wordsByCollectionPipe: WordsByCollectionPipe) {
      this.word = this.navParams.get('word');
      this.wordsList = this.navParams.get('words');
      this.collectionKey = this.navParams.get('collectionKey');

      this.wordsList
        .subscribe(words => {
          this.words = this.wordsByCollectionPipe.transform(words, undefined, this.collectionKey, 'content', undefined);
        });
  }

  ionViewDidLoad() {
    this.slides.initialSlide = this.words.findIndex(word => word.$key == this.word.$key);
  }
}
