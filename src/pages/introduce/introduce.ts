import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from "../home/home";
import { ContentPage } from "../content/content";
import { Utils } from "../../classes/utils";
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-introduce',
  templateUrl: 'introduce.html',
})
export class IntroducePage {
  slidesTemplate: any[] = [{ header: 'Welcome', body: '' },
                           { header: 'Learning English', body: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.', login: true }]

  constructor(
    public platform: Platform,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    public fb: Facebook) {
      afAuth.authState.subscribe(user => {
      if (!user)
        return;
      
      let email = Utils.RemoveDots(user.email);
      user['enemail'] = email;

      let ref = this.afDB.object(`/teacherKeys/${email}`);
        ref.subscribe(key => {

          // Teacher doesn't exist
          if (!key.$exists())
            this.afDB.object(`/studentKeys/${email}`)
              .subscribe(key => {

                // Student doesn't exist
                if (!key.$exists()) {
                  this.slidesTemplate[1] = { header: "Your profile doesn't exists", body: 'Please contact us by email sunny0soul@gmail.com and re-login', login: true };
                  this.afAuth.auth.signOut();
                }

                // Student not activated
                else if (key.$exists() && !key.$value) {
                  let ref = this.afDB.list(`/students/${email}/teacher`);
                    ref.subscribe(teacher => {
                      if (teacher.length > 0)
                        this.afDB.object(`/teachers/${teacher[0].$key}/students/${email}`).set(user.displayName);
                      ref.$ref.off();
                    });
                  this.afDB.database.ref(`/studentKeys/${email}`).set(user.displayName);
                  this.afDB.database.ref(`/students/${email}/nickname`).set(user.displayName);
                  this.afDB.database.ref(`/students/${email}/imageURL`).set(user.photoURL);
                }
                else {
                  user['type'] = 'student';
                  this.navCtrl.setRoot(HomePage);
                }
              });

          // Teacher not activated
          else if (key.$exists() && !key.$value) {
            let ref = this.afDB.list(`/teachers/${email}/students`);
              ref.subscribe(studentKeys => {
                studentKeys.forEach(studentKey => {
                  this.afDB.database.ref(`/students/${studentKey.$key}/teacher/${email}`).set(user.displayName);
                });
                ref.$ref.off();
              });
            this.afDB.database.ref(`/teacherKeys/${email}`).set(user.displayName);
            this.afDB.database.ref(`/teachers/${email}/nickname`).set(user.displayName);
            this.afDB.database.ref(`/teachers/${email}/imageURL`).set(user.photoURL);            
          }

          // Teacher exists
          else { 
            user['enemail'] = email;
            
            this.afDB.database.ref(`teachers/${email}/admin`).once('value')
              .then(admin => { 
                if (admin.val())
                  user['type'] = 'admin';
                else
                  user['type'] = 'teacher';

                this.navCtrl.setRoot(HomePage);
                ref.$ref.off();
              });
          }
        });
    });
  }
  
  onGetStartedClick() {
    this.signInWithFacebook();
  }

  onSkipClick() {}

  signInWithFacebook() {
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential);
      })
    }
    else {
      return this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }
  }
}
