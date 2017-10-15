import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Grammar } from "../../classes/grammar";
import { Lingua } from "../../classes/lingua";
import { WordsServiceProvider } from "../../providers/words-service/words-service";
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { GrammarsByCollectionPipe } from "../../pipes/grammars-by-collection/grammars-by-collection";

@Component({
  selector: 'page-grammar',
  templateUrl: 'grammar.html',
})
export class GrammarPage {
  type: string;
  grammars: Grammar[] = [];
  grammar: Grammar;
  grammarIndex: number = 0;
  collectionKey: string;
  words: string[];
  options: string[];
  result: string[] = [];
  index: number = 0;
  isCheckSentence: boolean;
  isLastGrammar: boolean;
  incorrectWords: number[] = [];
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public wordsService: WordsServiceProvider,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public grammarByCollectionPipe: GrammarsByCollectionPipe) {
      this.type = this.navParams.get('type');
      this.collectionKey = this.navParams.get('collection');

      if (this.type == 'content') {
        this.grammars.push(this.navParams.get('grammar'));
        this.words = this.grammars[this.grammarIndex].sentence.split(" ");        
      }
      else
        this.afDB.list(`grammarCollections/${this.collectionKey}`)
          .subscribe(grammars => {
            this.grammars = this.grammarByCollectionPipe.transform(grammars, undefined, this.collectionKey, 'training', [this.type]);
          });
        
        let grammarInterval = setInterval(() => {
          if (this.grammars.length > 0) {
            this.words = this.grammars[this.grammarIndex].sentence.split(" ");
            this.getOptions();
            clearInterval(grammarInterval);
          }
        }, 500)
  }

  onOptionClick(option: string, i: number) {
    this.result.push(this.options[i].toLowerCase());
    this.index++;
    
    // LAST WORD IN GRAMMAR
    if (this.words.length == this.index) {
      return;
    }
      
    this.getOptions();
  }

  onBackspaceClick() {
    this.index--;
    this.getOptions();
    this.result.pop();
    // var lastIndex = this.result.lastIndexOf(" ");
    // this.result = this.result.substring(0, lastIndex);
  }
  
  onNextClick() {
    this.incorrectWords.length = 0;
    if (this.equateAnswer()) {
      if (this.grammars.length - 1 == this.grammarIndex) {
        this.isLastGrammar = true;
        return;
      }

      this.afDB.database.ref(`/grammarLearned/${this.afAuth.auth.currentUser['enemail']}/grammar/collections/${this.collectionKey}/${this.type}/${this.grammars[this.grammarIndex].$key}`).set(true);
      this.grammarIndex++;
      this.index = 0;
      this.result.length = 0;
      this.words = this.grammars[this.grammarIndex].sentence.split(' ');
      this.getOptions();  
    }
    else {
      this.isCheckSentence = true;
    }
  }

  onReturnClick() {

  }

  onRepeatClick() {
    this.isCheckSentence = false;
    this.index = 0;
    this.result.length = 0;
    this.words = this.grammars[this.grammarIndex].sentence.split(' ');
    this.getOptions();
  }

  getOptions() {
    this.options = Lingua.checkForPronounsAndVerbs(this.words[this.index]);
    if (!this.options) {
      this.wordsService.getConjuction(this.words[this.index], 'getword')
        .subscribe(words => {
          if (words)
            this.options = words;
          else
            this.options = this.words;
        });
    }
  }

  equateAnswer(): boolean {
    let sentence = this.grammars[this.grammarIndex].sentence.toLowerCase().split(" ");
    for (let i = 0; i < this.result.length; i++)
      if (this.result[i] != sentence[i])
        this.incorrectWords.push(i);

    return this.result.every((v,i)=> v === sentence[i]);
  }

  isWordIncorrect(index) {
    return this.incorrectWords.filter(w => w == index).length > 0
  }
}
