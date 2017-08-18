import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ImagePicker } from '@ionic-native/image-picker';
import { File } from "@ionic-native/file";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { IntroducePage } from "../pages/introduce/introduce";
import { LoginPage } from "../pages/login/login";
import { CollectionsPage } from "../pages/collections/collections";
import { CollectionPage } from "../pages/collection/collection";
import { AddCollectionPage } from "../pages/add-collection/add-collection";
import { WordsPage } from "../pages/words/words";
import { AddWordPage } from "../pages/add-word/add-word";
import { CapitalizePipe } from "../pipes/capitalize/capitalize";
import { ReversePipe } from "../pipes/reverse/reverse";
import { WordsByCollectionPipe } from "../pipes/words-by-collection/words-by-collection";
import { CollectionsByTypePipe } from "../pipes/collections-by-type/collections-by-type";

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyAkcmdXMPyklcO0Te2Dcl1BjSELCdJ86ms",
  authDomain: "en4fun-795ce.firebaseapp.com",
  databaseURL: "https://en4fun-795ce.firebaseio.com",
  projectId: "en4fun-795ce",  
  storageBucket: "en4fun-795ce.appspot.com",
  messagingSenderId: "1027951549297"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    IntroducePage,
    LoginPage,
    CollectionsPage,
    CollectionPage,
    AddCollectionPage,
    WordsPage,
    AddWordPage,
    CapitalizePipe,
    ReversePipe,
    WordsByCollectionPipe,
    CollectionsByTypePipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    IntroducePage,
    LoginPage,
    CollectionsPage,
    CollectionPage,
    AddCollectionPage,
    WordsPage,
    AddWordPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook,
    ImagePicker,
    File
  ]
})
export class AppModule {}
