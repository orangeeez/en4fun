import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AddWordPage } from "../add-word/add-word";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
})
export class ContentPage {
  user: firebase.User;
  wordCollections: FirebaseListObservable<any[]>;
  collectionTypes: FirebaseListObservable<any[]>;
  collectionType: string;
  words: any[] = [];
  search: string = ""
  collection: string = "";

  constructor(
    public platform: Platform,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase) {
      this.user = this.afAuth.auth.currentUser;
      this.collectionTypes = this.afDB.list(`/collectionTypes`, { preserveSnapshot: true })
    }

    onAddWordClick() {
      this.navCtrl.push(AddWordPage);
    }

    onRemoveSelectClick() {
      this.collection = "";
    }

    onRemoveButtonClick(wordCollection, word) {
      this.afDB.database.ref(`/wordKeys/${word.$key}`).remove();
      this.afDB.database.ref(`/words/${word.$key}`).remove();
      this.afDB.database.ref(`/wordCollections/${wordCollection.key}/${word.$key}`).remove();
    }

    onSelectCollectionType() {
      switch (this.collectionType) {
        case 'vocabulary' :
          this.wordCollections = this.afDB.list(`/wordCollections`, { preserveSnapshot: true });      
          break;
      }
    }
}
