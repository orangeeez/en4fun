import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { CollectionPage } from "../collection/collection";
import { AddCollectionPage } from "../add-collection/add-collection";
import { ShareCollectionsPage } from "../share-collections/share-collections";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: firebase.User;
  studentsNames: any[] = [{ $value: 'All' }];
  studentKey: any = this.studentsNames[0];
  collectionTypes: FirebaseListObservable<any[]>;
  limits = {
    vocabulary: 2,
    grammar: 2,
    video: 2,
    reading: 1
  }
  studentCollections: any[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public fb: Facebook,
    public platform: Platform) {
      this.user = afAuth.auth.currentUser;

      if (this.user['type'] == 'admin' ||
          this.user['type'] == 'teacher') {
        this.afDB.list(`/teachers/${this.user['enemail']}/students`)
          .subscribe(students => {
            this.studentsNames.splice(1, this.studentsNames.length);
            students.forEach(student => {
              this.afDB.object(`/students/${student.$key}/nickname`)
                .subscribe(name => {
                  name['key'] = student.$key;
                  this.studentsNames.push(name);
                });
            });
          });
          
        this.collectionTypes = this.afDB.list('/collectionTypes');
      }
  }

  onAddCollectionClick(type: string) {
    this.navCtrl.push(AddCollectionPage, {
      type: type,
      action: 'add',
    });
  }

  onShareCollectionsClick(type: string) {
    this.navCtrl.push(ShareCollectionsPage, {
      type: type,
      studentKey: this.studentKey
    });
  }

  onCollectionClick(collection: any, type: string) {
    this.navCtrl.push(CollectionPage, {
      type: type,
      collection: collection,
      studentKey: this.studentKey.$value == 'All' ? undefined : this.studentKey
    });
  }

  onMoreCollectionsClick(type: string) {
    switch (type) {
      case 'vocabulary': this.limits[type] += 2; break;
      case 'grammar': this.limits[type] += 2; break;
      case 'video': this.limits[type] += 2; break;
      case 'reading': this.limits[type] += 1; break;
    };
  }
}
