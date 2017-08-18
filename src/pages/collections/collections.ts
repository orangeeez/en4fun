import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AddCollectionPage } from "../add-collection/add-collection";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Utils } from "../../classes/utils";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-collections',
  templateUrl: 'collections.html',
})
export class CollectionsPage {
  user: firebase.User;
  studentNames: any[] = [{$value : 'All'}];
  studentKey: any = this.studentNames[0];
  collections: FirebaseListObservable<any[]>;
  studentCollections: any[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase) {
      this.user = afAuth.auth.currentUser;
      this.user['type'] = 'teachers';

      if (this.user['type'] == 'teachers') {
          this.afDB.list(`/teachers/${Utils.RemoveDots(this.user.email)}/students`)
            .subscribe(students => {
              students.forEach(student => {
                this.afDB.object(`/students/${student.$key}/nickname`)
                  .subscribe(name => {
                    name['key'] = student.$key;
                    this.studentNames.push(name)
                  });
              });
            });

            this.collections = this.afDB.list('/collections');
      }
    }

    onAddCollectionClick() {
      if (this.studentKey == 'All')
        this.navCtrl.push(AddCollectionPage);
      else
        this.navCtrl.push(AddCollectionPage, {
          studentKey: this.studentKey
        })
    }

    onSelectStudentClick(studentKey: any) {
    this.afDB.list(`/students/${studentKey.key}/collections`)
      .subscribe(collections => {
        collections.forEach(collection => {
          this.studentCollections.push(this.afDB.object(`/collections/${collection.$key}`));
        });
      });
  }
}
