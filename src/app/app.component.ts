import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { HomePage } from '../pages/home/home';
import { IntroducePage } from "../pages/introduce/introduce";
import { LoginPage } from "../pages/login/login";
import { WordsPage } from "../pages/words/words";
import { Utils } from "../classes/utils";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = IntroducePage;
  pages: Array<{ title: string, component: any }>;
  user: firebase.User;
  badge: string;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase) {

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      afAuth.authState.subscribe(user => {
        if (!user)
          return;

        this.user = afAuth.auth.currentUser;
        this.afDB.object('/teachers')
          .subscribe(obj => {
            this.badge = obj.hasOwnProperty(Utils.RemoveDots(user.email)) ? 'Teach' : 'Study'; 
          });
      });

      this.pages = [
        { title: 'Home', component: HomePage },
        { title: 'Words', component: WordsPage }
      ];
    });
  }

  openPage(page: any) {
    this.nav.setRoot(page);
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.nav.setRoot(LoginPage);
  }
}

