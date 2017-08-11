import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  photo: string;

  constructor(
    public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private platform: Platform) {
  }
}
