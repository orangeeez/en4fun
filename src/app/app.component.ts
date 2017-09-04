import { Component, ViewChild } from '@angular/core';
import { Platform, Nav} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { HomePage } from '../pages/home/home';
import { IntroducePage } from "../pages/introduce/introduce";
import { ContentPage } from "../pages/content/content";
import { TeachersPage } from "../pages/teachers/teachers";
import { StudentsPage } from "../pages/students/students";
import { Utils } from "../classes/utils";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = IntroducePage;
  user: firebase.User;
  pages: Array<{ title: string, component: any, hidden: boolean }>;
  badge: string;

  constructor(
    public platform: Platform,
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
        
        this.user = user;
        let email = Utils.RemoveDots(user.email);

        this.afDB.object(`/teachers/${email}/admin`)
          .subscribe(property => {
            if (!property.$exists()) 
              this.badge = 'Study';
            else if (property.$value)
              this.badge = 'Admin';
            else 
              this.badge = 'Teach';

            this.pages = [
              { title: 'Home', component: HomePage, hidden: false },
              { title: 'Teachers', component: TeachersPage, 
                hidden: this.badge == 'Admin' ||
                        this.badge == 'Teach' ? false : true },
              { title: 'Students', component: StudentsPage, 
                hidden: this.badge == 'Admin' ||
                        this.badge == 'Teach' ? false : true },        
              { title: 'Words', component: ContentPage,
                hidden: this.badge == 'Admin' ||
                        this.badge == 'Teach' ? false : true }
            ];
          });
      });
    });
  }

  openPage(page: any) {
    this.nav.setRoot(page);
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.nav.setRoot(IntroducePage);
  }
}

