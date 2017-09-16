import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-share-collections',
  templateUrl: 'share-collections.html',
})
export class ShareCollectionsPage {
  type: string;
  studentKey: any;
  studentCollections: any[];
  allCollections: any[];
  sharedCollections: any[];
  removedCollections: any[];
  isCheckmarkDisabled: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase) {
    this.type = this.navParams.get('type');
    this.studentKey = this.navParams.get('studentKey');
    this.allCollections = [];
    this.sharedCollections = [];
    this.removedCollections = [];

    this.afDB.list(`/students/${this.studentKey.key}/collections/${this.type}`)
      .subscribe(collections => {
        this.studentCollections = collections;
        this.afDB.list(`/collections/${this.type}`)
          .subscribe(allCollections => {
            this.allCollections = allCollections;
            this.allCollections.forEach(collection => {
              if (this.studentCollections.filter(obj => obj.$key == collection.$key).length > 0)
                collection['checked'] = true;
            });
          });
      });
  }

  onRadioButtonClick(collection: any) {
    this.isCheckmarkDisabled = false;

    if (collection.checked) {
      collection.checked = false;
      this.removedCollections.push(collection);
      this.sharedCollections = this.sharedCollections.filter(obj => obj.$key != collection.$key);      
    }
    else {
      collection.checked = true;
      this.sharedCollections.push(collection);
      this.removedCollections = this.removedCollections.filter(obj => obj.$key != collection.$key);            
    }
  }

  onCheckmarkClick() {
    for (let collection of this.sharedCollections)
      this.afDB.database.ref(`/students/${this.studentKey.key}/collections/${this.type}`).child(collection.$key).set(true);

    for (let collection of this.removedCollections)
      this.afDB.database.ref(`/students/${this.studentKey.key}/collections/${this.type}`).child(collection.$key).remove();

    this.navCtrl.pop();
  }
}
