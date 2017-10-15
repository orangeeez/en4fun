import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { TitleCasePipe } from "@angular/common";
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { File } from "@ionic-native/file";
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { IntroducePage } from "../pages/introduce/introduce";
import { CollectionsPage } from "../pages/collections/collections";
import { CollectionPage } from "../pages/collection/collection";
import { AddCollectionPage } from "../pages/add-collection/add-collection";
import { ContentPage } from "../pages/content/content";
import { AddWordPage } from "../pages/add-word/add-word";
import { ShareCollectionsPage } from "../pages/share-collections/share-collections";
import { WordPage } from "../pages/word/word";
import { TeachersPage } from "../pages/teachers/teachers";
import { StudentsPage } from "../pages/students/students";
import { ReadingPage } from "../pages/reading/reading";
import { AddReadingPage, ReadingText, ReadingImage, ReadingQuote } from "../pages/add-reading/add-reading";
import { AddVideoPage } from "../pages/add-video/add-video";
import { VideoPage } from "../pages/video/video";
import { AddGrammarPage } from "../pages/add-grammar/add-grammar";
import { GrammarPage } from "../pages/grammar/grammar";

import { CapitalizePipe } from "../pipes/capitalize/capitalize";
import { ReversePipe } from "../pipes/reverse/reverse";
import { WordsByCollectionPipe } from "../pipes/words-by-collection/words-by-collection";
import { CollectionsByTypePipe } from "../pipes/collections-by-type/collections-by-type";
import { ImageByKeyPipe } from "../pipes/image-by-key/image-by-key";
import { DependencyByKeyPipe } from "../pipes/dependency-by-key/dependency-by-key";
import { IsHasTeacherPipe } from "../pipes/is-has-teacher/is-has-teacher";
import { SpaceCapitalLettersPipe } from "../pipes/space-capital-letters/space-capital-letters";
import { AddSpaceCharacterPipe } from "../pipes/add-space-character/add-space-character";
import { SplitByWordPipe } from "../pipes/split-by-word/split-by-word";
import { ReadingsByCollectionPipe } from "../pipes/readings-by-collection/readings-by-collection";
import { ParseDatePipe } from "../pipes/parse-date/parse-date";
import { VideosByCollectionPipe } from "../pipes/videos-by-collection/videos-by-collection";
import { GrammarsByCollectionPipe } from "../pipes/grammars-by-collection/grammars-by-collection";
import { SafeHtmlDirective } from "../directives/safe-html/safe-html";
import { GrammarValueDirective } from "../directives/grammar-value/grammar-value";

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { WordsServiceProvider } from '../providers/words-service/words-service';
import { SafePipe } from "../pipes/safe/safe";

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
    CollectionsPage,
    CollectionPage,
    AddCollectionPage,
    ContentPage,
    AddWordPage,
    ShareCollectionsPage,
    WordPage,
    TeachersPage,
    StudentsPage,
    ReadingPage,
    AddReadingPage,
    AddVideoPage,
    VideoPage,
    AddGrammarPage,
    GrammarPage,
    CapitalizePipe,
    ReversePipe,
    WordsByCollectionPipe,
    CollectionsByTypePipe,
    ImageByKeyPipe,
    DependencyByKeyPipe,
    IsHasTeacherPipe,
    SpaceCapitalLettersPipe,
    AddSpaceCharacterPipe,
    SplitByWordPipe,
    ReadingsByCollectionPipe,
    SafePipe,
    ParseDatePipe,
    VideosByCollectionPipe,
    GrammarsByCollectionPipe,
    ReadingText,
    ReadingImage,
    ReadingQuote,
    SafeHtmlDirective,
    GrammarValueDirective
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    IntroducePage,
    CollectionsPage,
    CollectionPage,
    AddCollectionPage,
    ContentPage,
    AddWordPage,
    ShareCollectionsPage,
    WordPage,
    TeachersPage,
    StudentsPage,
    ReadingPage,
    AddReadingPage,
    AddVideoPage,
    VideoPage,
    AddGrammarPage,
    GrammarPage,
    ReadingText,
    ReadingImage,
    ReadingQuote
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook,
    File,
    WordsServiceProvider,
    SpaceCapitalLettersPipe,
    GrammarsByCollectionPipe,
    WordsByCollectionPipe,
    TitleCasePipe,
    YoutubeVideoPlayer
  ]
})
export class AppModule {}
