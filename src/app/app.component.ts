import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { HomePage } from '../pages/home/home';
import { IntroducePage } from "../pages/introduce/introduce";
import { LoginPage } from "../pages/login/login";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = IntroducePage;
  pages: Array<{ title: string, component: any }>;
  public user: firebase.User;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public afAuth: AngularFireAuth) {

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      afAuth.authState.subscribe(user => {
        if (!user)
          return;

          this.user = afAuth.auth.currentUser;
      });
        
      this.pages = [
        { title: 'Home', component: HomePage },
      ];
    });
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.nav.setRoot(LoginPage);
  }
}

