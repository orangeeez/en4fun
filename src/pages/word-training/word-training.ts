import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { WordsByCollectionPipe } from "../../pipes/words-by-collection/words-by-collection";
import { Lingua } from "../../classes/lingua";

@Component({
  selector: 'page-word-training',
  templateUrl: 'word-training.html',
})
export class WordTrainingPage {
  words: any[] = [];
  options: any[] = [];
  training: any;
  collectionKey: string;
  wordIndex: number = 0;
  randomTranslationIndex: number = 0;
  result: any;  
  isCheckWord: boolean;
  isLastWord: boolean;
  isWordTranslationSelected: boolean;
  isTranslationWordSelected: boolean;
  isConstructorSelected: boolean;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public wordsByCollectionPipe: WordsByCollectionPipe) {
      this.training = this.navParams.get('training');
      this.collectionKey = this.navParams.get('collection');

      this.afDB.list(`wordCollections/${this.collectionKey}`)
        .subscribe(words => {
          this.words = this.wordsByCollectionPipe.transform(words, undefined, this.collectionKey, 'training', [this.training.type]);
        });

        let wordInterval = setInterval(() => {
          if (this.words.length > 0) {
            this.getOptions();
            clearInterval(wordInterval);
          }
        }, 500)
  }

  getOptions() {
    let index = 0;    
    let copy;
    let answer;
    switch (this.training.type) {
      case 'wordtranslation':
        index = 0;
        copy = this.words.slice();
        answer = copy.splice(this.wordIndex, 1)[0];
        this.isWordTranslationSelected = true;
        this.options.push(answer.translations[0]); 
        
        while (this.options.length != 8) {
          if (index > copy.length - 1) {
            let subWords = this.afDB.list(`/wordCollections/${this.collectionKey}`)
              subWords.subscribe(wordKeys => {
                let left = 8 - this.options.length;
                
                let random = Math.floor(Math.random() * wordKeys.length) - left;
                if (random < 0) random = 0;
                
                let max = random + left;
                if (max >= wordKeys.length - 1) max = wordKeys.length;

                for (let key of Lingua.shuffleArray(wordKeys).slice(random, max)) {
                  let subTranslations = this.afDB.object(`/words/${key.$key}/translations`)
                    subTranslations.subscribe(translations => {
                      if (translations[0] != answer.translations[0] &&
                          !(this.options.filter(option => option == translations[0]).length > 0)) {
                        this.options.push(translations[0]);
                        subTranslations.$ref.off();
                        subWords.$ref.off();
                      }
                    });
                }
              });
              break;
          }
          else {
            this.options.push(Lingua.shuffleArray(copy)[index].translations[0]);
            index++;
          }
        }
      break;
      case 'translationword':
        index = 0;
        copy = this.words.slice();
        answer = copy.splice(this.wordIndex, 1)[0];
        this.randomTranslationIndex = Math.floor(Math.random() * ((this.words[index].translations.length - 1) - 0 + 1)) + 0;
        this.isTranslationWordSelected = true;
        this.options.push(answer.$key);
        while (this.options.length != 8) {
          if (index > copy.length - 1) {
            let subWords = this.afDB.list(`/wordCollections/${this.collectionKey}`)
            subWords.subscribe(wordKeys => {
              let left = 8 - this.options.length;
              
              let random = Math.floor(Math.random() * wordKeys.length) - left;
              if (random < 0) random = 0;
              
              let max = random + left;
              if (max >= wordKeys.length - 1) max = wordKeys.length;

              for (let key of Lingua.shuffleArray(wordKeys).slice(random, max)) {
                if (key.$key != this.words[this.wordIndex].$key &&
                    !(this.options.filter(option => option == key.$key).length > 0)) {
                  this.options.push(key.$key);
                  subWords.$ref.off();
                }
              }
            });
            break;
          }
          else {
            this.options.push(Lingua.shuffleArray(copy)[index].$key);
            index++;
          }
        }
      break;
      case 'constructor':
        this.randomTranslationIndex = Math.floor(Math.random() * ((this.words[index].translations.length - 1) - 0 + 1)) + 0;
        this.isConstructorSelected = true;
        this.options = this.options.concat(Lingua.shuffleArray(Array.from(this.words[this.wordIndex].$key)));
      break;
    }
  }

  onOptionClick(option) {
    switch (this.training.type) {
      case 'wordtranslation':
        this.result = option;
      break;
      case 'translationword': 
        this.result = option;
      break;
      case 'constructor':
        if (!this.result)
          this.result = [option];
        else 
          this.result.push(option);
          let index = this.options.indexOf(option);
          this.options.splice(index, 1);
      break;
    }
  }

  onNextClick() {
    switch (this.training.type) {
      case 'wordtranslation':
        if (this.words[this.wordIndex].translations.filter(translation => translation == this.result).length > 0) {
          if (this.words.length - 1 == this.wordIndex) {
            this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);           
            this.isLastWord = true;
            this.result = '';
            return;
          }

          this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);          
          this.wordIndex++;
          this.result = '';
          this.options.length = 0;
          this.getOptions();
        }
        else 
          this.isCheckWord = true        
      break;
      case 'translationword':
        if (this.result == this.words[this.wordIndex].$key) {
          if (this.words.length - 1 == this.wordIndex) {
            this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);                    
            this.isLastWord = true;
            this.result = '';            
            return;
          }

          this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);          
          this.wordIndex++;
          this.result = '';
          this.options.length = 0;
          this.getOptions();
        }
        else 
          this.isCheckWord = true
      break;
      case 'constructor':
        if (this.result.join('') == this.words[this.wordIndex].$key) {
          if (this.words.length - 1 == this.wordIndex) {
            this.isLastWord = true;
            this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);                    
            return;
          }

          this.afDB.database.ref(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${this.collectionKey}/${this.training.type}/${this.words[this.wordIndex].$key}`).set(true);          
          this.wordIndex++;
          this.result = [];
          this.options.length = 0;
          this.getOptions();
        }
        else 
          this.isCheckWord = true;

      break;
    }
  }
  
  onRepeatClick() {
    this.isCheckWord = false;
    switch (this.training.type) {
      case 'wordtranslation': this.result = '';
      break;
      case 'translationword': this.result = '';      
      break;
      case 'constructor':
        this.result.length = 0;
        this.options.length = 0;
        this.getOptions();
      break;
    }
  }

  onReturnClick() {
    this.navCtrl.pop();
  }

  onCancelClick() {
    switch(this.training.type) {
      case 'wordtranslation':
        this.result = '';
      break;
      case 'translationword':
        this.result = '';        
      break
      case 'constructor':
        this.result = [];        
      break;

    }
  }

  onBackspaceClick() {
    let element = this.result.pop();
    this.options.push(element);
    Lingua.shuffleArray(this.options);
  }

  isWordIncorrect() {
    switch (this.training.type) {
      case 'wordtranslation': return this.result != this.words[this.wordIndex].translations[this.randomTranslationIndex];
      case 'translationword': return this.result != this.words[this.wordIndex].$key;
      case 'constructor': return this.result.join() != this.words[this.wordIndex].$key;
    }
  }
}
