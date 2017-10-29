import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-teachers',
  templateUrl: 'teachers.html',
})
export class TeachersPage {
  user: firebase.User;
  studentKeys: FirebaseListObservable<any[]>;
  teacherKeys: FirebaseListObservable<any[]>;
  studentNames: any[];
  teacherStudentNames: { [name: string]: any[] };
  studentCheckedNames: boolean[];
  studentDisabledNames: boolean[];
  email: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
      this.user = this.afAuth.auth.currentUser;
      this.teacherStudentNames = {};
      this.studentCheckedNames = [];
      this.studentDisabledNames = [];
      this.teacherKeys = this.afDB.list(`/teacherKeys`);
      this.studentKeys = this.afDB.list(`/studentKeys`);

      let ref = this.teacherKeys
        .subscribe(teacherKeys => {
          teacherKeys.forEach(teacherKey => {
            this.teacherStudentNames[teacherKey.$key] = [];
          });
          ref.unsubscribe();
        });
  }

  onAddTeacherClick() {
    if (this.studentNames)
      for (let studentName of this.studentNames) {
        this.afDB.database.ref(`/teachers/${this.email}/students/${studentName.$key}`).set(studentName.$value);
        this.afDB.database.ref(`/students/${studentName.$key}/teacher/${this.email}`).set('');
      }

    this.afDB.database.ref(`/teachers/${this.email}/admin`).set(false);
    this.afDB.database.ref(`/teacherKeys/${this.email}`).set('');
    this.afDB.database.ref(`/teacherPlaylists/${this.email}`).set('');    
    this.teacherStudentNames[this.email] = this.studentNames;
    this.email = '';
    this.studentNames = [];
  }

  onSelectChange(teacherKey, sliding) {
    this.afDB.database.ref(`/teachers/${teacherKey.$key}/students`).once('value')
      .then(studentKeys => {
        if (studentKeys.val())
          for (let studentKey of Object.keys(studentKeys.val()))
            this.afDB.database.ref(`/students/${studentKey}/teacher/`).remove();

        this.afDB.database.ref(`/teachers/${teacherKey.$key}/students/`).remove();
        for (let studentName of this.teacherStudentNames[teacherKey.$key]) {
          this.afDB.database.ref(`/teachers/${teacherKey.$key}/students/${studentName.$key}`).set(studentName.$value);
          this.afDB.database.ref(`/students/${studentName.$key}/teacher/${teacherKey.$key}`).set(teacherKey.$value);
        }
      });

    sliding.close();
  }

  onSelectCancel(sliding) {
    sliding.close();
  }

  onItemSwipe(teacherKey) {
    teacherKey['isEdit'] = true;
    this.studentCheckedNames = [];
    this.studentDisabledNames = [];
    let ref = this.afDB.list(`/teachers/${teacherKey.$key}/students`)
    ref.subscribe(teacherStudents => {
      this.studentKeys
        .subscribe(studentKeys => {
          studentKeys.forEach(studentKey => {
            this.afDB.database.ref(`students/${studentKey.$key}/teacher`).once('value')
              .then(hasTeacher => {
                if (hasTeacher.val())
                  this.studentDisabledNames.push(true);
                else
                  this.studentDisabledNames.push(false);
              });

            if (teacherStudents.filter(teacherStudent => teacherStudent.$key == studentKey.$key).length > 0)
              this.studentCheckedNames.push(true);
            else
              this.studentCheckedNames.push(false);
          });
          
          this.studentKeys.$ref.off();
        });
    });
  }

  onRemoveTeacherClick(teacherKey: string) {
    for (let studentName of this.teacherStudentNames[teacherKey])
      this.afDB.database.ref(`/students/${studentName.$key}/teacher/`).remove();

    this.afDB.database.ref(`/teacherKeys/${teacherKey}`).remove();
    this.afDB.database.ref(`/teachers/${teacherKey}`).remove();

  }
}
