import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from "angularfire2/database";
import { Grammar } from "../../classes/grammar";

@Component({
  selector: 'page-add-grammar',
  templateUrl: 'add-grammar.html',
})
export class AddGrammarPage {
  isEdit: boolean;
  grammar: Grammar;
  selectedCollection: any;
  previousCollection: any;
  collectionKeys: FirebaseListObservable<any[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase) {
      this.isEdit = this.navParams.get('edit');
      this.grammar = this.navParams.get('grammar') ? this.navParams.get('grammar') : new Grammar();
      this.collectionKeys = this.afDB.list('/collectionKeys/grammar');
      this.previousCollection = this.navParams.get('collection');
      this.selectedCollection = this.previousCollection ? this.previousCollection.key : 'other';
  }

  onCheckmarkClick() {
    /*

    // IF add grammar entity
    if (!this.isEdit) {
      this.afDB.database.ref(`/grammarCollections/${this.selectedCollection}`).push(true)
        .then(ref => {
          this.afDB.database.ref(`/grammars/${ref.key}`).set({
            sentence: this.grammar.sentence,
            translation: this.grammar.translation
          });
          this.afDB.database.ref(`/grammarKeys/${ref.key}`).set({ used: this.selectedCollection ? true : false });
        });
    }
    // ELSE edit grammar entity
    else {
      // IF collection didn't change
      if (this.selectedCollection == this.previousCollection.key) {
        this.afDB.database.ref(`/grammars/${this.grammar['$key']}`).update({
          sentence: this.grammar.sentence,
          translation: this.grammar.translation
        });
        this.afDB.database.ref(`/grammarKeys/${this.grammar['$key']}`).update({ used: this.selectedCollection ? true : false });
      }
      // ELSE collection was changed
      else {
        this.afDB.database.ref(`/grammarCollections/${this.previousCollection.key}/${this.grammar['$key']}`).remove();
        this.afDB.database.ref(`/grammarCollections/${this.selectedCollection}/${this.grammar['$key']}`).set(true);        
      }
    }
    this.navCtrl.pop();


    */
  }
}
