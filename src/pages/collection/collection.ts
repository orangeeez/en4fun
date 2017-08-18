import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AddCollectionPage } from "../add-collection/add-collection";
import { HomePage } from "../home/home";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-collection',
  templateUrl: 'collection.html',
})
export class CollectionPage {
  user: firebase.User;
  moreSheet: any;
  type: string;
  studentKey: string;
  collectionKey: string;
  words: any[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController) {
      this.words = [];
      this.user = this.afAuth.auth.currentUser;
      this.type = this.navParams.get('type');
      this.collectionKey = this.navParams.get('collectionKey');

      this.afDB.object(`wordCollections/${this.collectionKey}`)
        .subscribe(wordCollection => {
          for (let wordKey in wordCollection)
            this.afDB.object(`words/${wordKey}`)
              .subscribe(word => {
                this.words.push(word);
              });
        });
  }

  onMoreClick() {
    this.moreSheet = this.actionSheetCtrl.create({
      title: 'Collection',
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            this.onEditClick();
          }
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.onRemoveClick();
          }
        }
      ]
    });
    this.moreSheet.present();
  }

  onEditClick() {
    this.navCtrl.push(AddCollectionPage, {
      type: this.type,
      action: 'edit',
      collectionKey: this.collectionKey
    });
  };

  onRemoveClick() {
    let confirm = this.alertCtrl.create({
      title: 'Remove Collection',
      message: `Do you want to remove ${this.collectionKey} collection?`,
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: () => {
            // Remove collection from collection keys
            this.afDB.database.ref(`/collectionKeys/${this.type}/${this.collectionKey}`).remove();

            // Remove collection from collections 
            this.afDB.database.ref(`/collections/${this.type}/${this.collectionKey}`).remove();

            // Unused words used in collection
            for (let word of this.words) {
              this.afDB.database.ref(`/wordCollections/${this.collectionKey}`).remove();
              this.afDB.database.ref(`/wordKeys/${word.$key}`).update({ used: false });
            }

            // Remove collection from students
            this.afDB.list('/studentKeys')
              .subscribe(studentKeys => {
                studentKeys.forEach(studentKey => {
                  this.afDB.database.ref(`/students/${studentKey.$key}/collections/${this.type}/${this.collectionKey}`).remove();                        
                });
              });

            this.navCtrl.setRoot(HomePage);
          }
        }
      ]
    });
    confirm.present();
  }
}
