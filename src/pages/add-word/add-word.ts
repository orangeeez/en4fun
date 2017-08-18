import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-add-word',
  templateUrl: 'add-word.html',
})
export class AddWordPage {
  wordKey: string;
  collectionKeys: FirebaseListObservable<any[]>
  selectedCollection: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase,) {
      this.collectionKeys = this.afDB.list('/collectionKeys');
    }
}
