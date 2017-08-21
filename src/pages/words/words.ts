import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AddWordPage } from "../add-word/add-word";

@Component({
  selector: 'page-words',
  templateUrl: 'words.html',
})
export class WordsPage {
  wordCollections: FirebaseListObservable<any[]>;
  words: any[] = [];
  search: string = ""
  collection: string = "";
  collectionKeys: FirebaseListObservable<any[]>;

  constructor(
    public platform: Platform,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase) {
      this.collectionKeys = this.afDB.list(`/collectionKeys/vocabulary`);
      this.wordCollections = this.afDB.list(`/wordCollections`, { preserveSnapshot: true });
    }

    onAddWordClick() {
      this.navCtrl.push(AddWordPage);
    }

    onRemoveSelectClick() {
      this.collection = "";
    }
}
