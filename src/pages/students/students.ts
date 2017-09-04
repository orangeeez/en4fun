import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-students',
  templateUrl: 'students.html',
})
export class StudentsPage {
  user: firebase.User;
  studentKeys: FirebaseListObservable<any[]>;
  teacherKeys: FirebaseListObservable<any[]>;
  teacherKey: any;
  email: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
      this.user = this.afAuth.auth.currentUser;
      this.studentKeys = this.afDB.list(`studentKeys`);
      this.teacherKeys = this.afDB.list(`teacherKeys`);
  }

  onAddStudentClick() {
    if (this.teacherKey) {
      this.afDB.database.ref(`/teachers/${this.teacherKey.$key}/students/${this.email}`).set('');
      this.afDB.database.ref(`/students/${this.email}/teacher/${this.teacherKey.$key}`).set(this.teacherKey.$value);
    }

    this.afDB.database.ref(`/studentKeys/${this.email}`).set('');
    this.afDB.database.ref(`/students/${this.email}/nickname`).set('');
    this.email = '';
    this.teacherKey = '';
  }

  onRemoveStudentClick(studentKey: string) {
    this.afDB.list(`/students/${studentKey}/teacher`)
      .subscribe(teacher => {
        if (teacher.length > 0)
          this.afDB.database.ref(`/teachers/${teacher[0].$key}/students/${studentKey}`).remove();

        this.afDB.database.ref(`/studentKeys/${studentKey}`).remove();
        this.afDB.database.ref(`/students/${studentKey}`).remove();
      }).unsubscribe();
  }
}
