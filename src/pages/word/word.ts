import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

@Component({
  selector: 'page-word',
  templateUrl: 'word.html',
})
export class WordPage {
  @ViewChild(Slides) slides: Slides;
  word: any;
  words: any[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams) {
      this.word = this.navParams.get('word');
      this.words = this.navParams.get('words');
  }

  ionViewDidLoad() {
    this.slides.initialSlide = this.words.indexOf(this.word);
  }
}
