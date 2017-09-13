import { Component } from '@angular/core';
import { File } from "@ionic-native/file";
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { HomePage } from "../../pages/home/home";
import { Collection } from "../../classes/collection";
import { Utils } from "../../classes/utils";
import { FirebaseApp } from 'angularfire2';
import 'firebase/storage';

@Component({
  selector: 'page-add-collection',
  templateUrl: 'add-collection.html',
})
export class AddCollectionPage {
  collection: Collection;
  collectionKey: string;
  type: string;
  action: string;
  name: string;
  selectedStudents: any[];
  selectedStudentKeys: any[];
  selectedWords: any[];
  selectedReadings: any[];
  imageURL: string = 'assets/images/add.jpg';
  wordKeys: FirebaseListObservable<any[]>;
  readingKeys: FirebaseListObservable<any[]>;
  studentKeys: FirebaseListObservable<any[]>;
  isStudentsSelected: boolean;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public firebaseApp: FirebaseApp,
    public file: File) {
      this.selectedWords = [];
      this.selectedReadings = [];
      this.selectedStudents = [];
      this.selectedStudentKeys = [];
      this.selectedStudents = [];
      this.collection = new Collection();
      this.type = this.navParams.get('type');
      this.action = this.navParams.get('action');
      this.collectionKey = this.navParams.get('collectionKey');

      switch (this.type) {
        case 'vocabulary' : this.wordKeys = this.afDB.list('/wordKeys'); break;
        case 'grammar' :  break;
        case 'video' : break;
        case 'reading' : this.readingKeys = this.afDB.list('/readingKeys'); break;
      };

      this.studentKeys = this.afDB.list(`/teachers/${Utils.RemoveDots(this.afAuth.auth.currentUser.email)}/students`);
      
      if (this.action == 'add')
        this.isStudentsSelected = true;

      if (this.action == 'edit') {
        this.name = this.collectionKey;
        this.afDB.object(`/collections/${this.type}/${this.collectionKey}`)
          .subscribe(collection => this.collection.imageURL = collection.imageURL);

        // Set users that belong to edited collection 
        this.studentKeys
          .subscribe(studentKeys => {
            studentKeys.forEach((studentKey, i) => {
              this.afDB.object(`/students/${studentKey.$key}/collections/${this.type}/${this.collectionKey}`)
                .subscribe(collection => {
                  if (studentKeys.length == i + 1)
                    this.isStudentsSelected = true;

                  if (collection.$exists()) {
                    this.selectedStudents.push(studentKey);
                    this.selectedStudentKeys.push(studentKey.$key);
                  }
                });
            });
          });
      }
  }

  onCheckmarkCollectionClick() {
        // Add new collection to selected users
        for (let selectedStudent of this.selectedStudents)
          this.afDB.database.ref(`/students/${selectedStudent.key}/collections/${this.type}`).child(this.name).set(true);

        // Add new collection to collection array
        this.afDB.database.ref(`/collections/${this.type}`).child(this.name).set(this.collection);

        // Add new collection to collection keys
        this.afDB.database.ref(`/collectionKeys/${this.type}`).child(this.name).set(true);
        
        switch (this.type) {
          case 'vocabulary' :
            // Add collection template for words
            this.afDB.database.ref('/wordCollections').child(this.name).set(true);

            // Add words to new collection and set used 'word'
            for (let selectedWord of this.selectedWords) {
              this.afDB.database.ref('/wordCollections').child(this.name).child(selectedWord.$key).set(true);
              this.afDB.database.ref('/wordCollections/other').child(selectedWord.$key).remove();
              this.wordKeys.update(`${selectedWord.$key}`, { used: true });
            }
          
            break;
            case 'reading' :
              this.afDB.database.ref('/readingCollections').child(this.name).set(true);
            
              for (let selectedWord of this.selectedWords) {
                this.afDB.database.ref('/readingCollections').child(this.name).child(selectedWord.$key).set(true);
                this.afDB.database.ref('/readingCollections/other').child(selectedWord.$key).remove();
                this.readingKeys.update(`${selectedWord.$key}`, { used: true });
              }
            break;
          }
          this.navCtrl.pop();
  }

  onAddImageClick() {
    this.collection.imageURL = this.imageURL;
  }
}
