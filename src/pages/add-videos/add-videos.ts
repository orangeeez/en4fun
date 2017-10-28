import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, ModalController, ViewController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { AngularFireAuth } from 'angularfire2/auth';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player'
import { EditVideoPage } from "../edit-video/edit-video";
import YouTube from 'simple-youtube-api';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-add-videos',
  templateUrl: 'add-videos.html',
})
export class AddVideosPage {
  user: firebase.User;
  youtube: any;
  playlistName: string;
  playlistVideos: any[];
  searchVideos: any[]; 
  collectionKeys: FirebaseListObservable<any[]>;
  search: string;
  timeout: any;
  checkedVideos: any[] = [];
  selectedCollection: any;
  selectedVideoCollection: FirebaseListObservable<any[]>;
  constructor(
    public platform: Platform,
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    public youtubePlayer: YoutubeVideoPlayer) {
      this.user = this.afAuth.auth.currentUser;
      this.collectionKeys = this.afDB.list(`videoCollections`);

      this.afDB.object(`/teacherPlaylists/${this.user['enemail']}`)
        .subscribe(playlist => {
          if (playlist.$value == '')
            this.showPlaylistRequest();
          else {
            this.youtube = new YouTube('AIzaSyAkcmdXMPyklcO0Te2Dcl1BjSELCdJ86ms');
            this.youtube.getPlaylist(playlist.$value)
              .then(playlist => {
                playlist.getVideos()
                  .then(videos => {
                    this.playlistName = playlist.title;
                    this.playlistVideos = videos.filter(v => v.title != 'Private video' && v.description != 'This video is private.');
                  });
              });
          }
        });
    }
    
    onSearchKeyup() {
      var self = this;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function() {
        self.youtube.searchVideos(self.search)
          .then(videos => {
            self.searchVideos = videos;
            if (this.selectedCollection)
              self.onSelectColectionChange();
          });
      }, 500);
    }

    onVideoCheckboxClick(video, checked: boolean) {
      video['checked'] = checked;

      if (!checked) {
        var index = this.checkedVideos.indexOf(video.id);
        if (index != -1)
          this.checkedVideos.splice(index, 1);
      }
      else
        if (!this.checkedVideos.some(v => v == video.id))
          this.checkedVideos.push(video.id);
    }

    onCheckmarkClick() {
      this.afDB.database.ref(`/videoCollections/${this.selectedCollection}`).set(this.checkedVideos);    
      this.navCtrl.pop();
    }
    
    onEditVideoClick(video: any) {
      this.navCtrl.push(EditVideoPage, {
        collectionKey: this.selectedCollection ? this.selectedCollection : 'other',
        videoKey: video.id,
        video: video
      });
    }

    onSearchClear() {
      this.searchVideos = undefined;
    }

    onPlayVideoClick(id: string) {
      this.youtubePlayer.openVideo(id);
    }

    onRemoveSelectClick() {
      this.selectedCollection = '';
    }

    onSelectColectionChange() {
      if (this.selectedCollection)
        if (!this.selectedVideoCollection) {
          this.selectedVideoCollection = this.afDB.list(`/videoCollections/${this.selectedCollection}`);
        }
        
          this.selectedVideoCollection.subscribe(videos => {
            if (this.searchVideos) {
              for (let video of videos) {
                if (!this.checkedVideos.some(v => v == video.$value))
                  this.checkedVideos.push(video.$value);

                this.searchVideos.filter(searchVideo => {
                  if (searchVideo.id == video.$value) {
                    searchVideo['checked'] = true;
                  }
                });
              }
            }
            else {
              for (let video of videos) {
                if (!this.checkedVideos.some(v => v == video.$value))
                  this.checkedVideos.push(video.$value);

                this.playlistVideos.filter(playlistVideo => {
                  if (playlistVideo.id == video.$value)
                    playlistVideo['checked'] = true;
                });
              }
            }
          }).unsubscribe();
    }

    showPlaylistRequest() {
      let prompt = this.alertCtrl.create({
        title: 'YouTube',
        message: "Enter link or ID of playlist",
        inputs: [
          {
            name: 'playlistLink',
            placeholder: 'Link or ID'
          },
        ],
        buttons: [
          {
            text: 'Skip',
            handler: data => {}
          },
          {
            text: 'Save',
            handler: data => { 
              if (/https:\/\/www.youtube.com\/playlist\?list=/.test(data.playlistLink))
                this.afDB.database.ref(`/teacherPlaylists/${this.user['enemail']}`).set(data.playlistLink); 
            }
          }
        ]
      });
      prompt.present();
    }
}

@Component({
  selector: 'video-modal',
  templateUrl: 'video-modal.html'
})
export class VideoModal {
    questionsAnswer: FirebaseListObservable<any[]>;
    questionsTrueFalse: FirebaseListObservable<any[]>;
    mockQuestionsAnswer: any[];
    collectionKey: string;
    videoKey: string
    segment: string = 'answer';
    isAddActive: boolean;
    constructor(
      public viewCtrl: ViewController,
      public navParams: NavParams,
      public afDB: AngularFireDatabase) {
      this.collectionKey = navParams.get('collectionKey');
      this.videoKey = navParams.get('videoKey');

      this.questionsAnswer = this.afDB.list(`/videoQuestions/${this.collectionKey}/${this.videoKey}/answer`);
      this.questionsTrueFalse = this.afDB.list(`/videoQuestions/${this.collectionKey}/${this.videoKey}/truefalse`);
    }
  
    onAddClick() {
      this.isAddActive = true;
      switch (this.segment) {
        case 'answer':
          this.mockQuestionsAnswer = [{
            type: 'answer',
            placeholder: 'Enter a question',
            text: '',
            answers: []
          }];
          break;
        case 'truefalse':
          this.mockQuestionsAnswer = [{
            type: 'truefalse',
            placeholder: 'Enter a question',
            text: '',
            isTrue: false
          }];
          break;
      }
    }
  
    onTextareaKeyup(index: number, question: any) {
      switch (this.segment) {
        case 'answer':
          if (index == this.mockQuestionsAnswer.length - 1) {
            this.mockQuestionsAnswer.push({
              type: 'answer',
              placeholder: 'Enter next question',
              text: '',
              answers: []
            });
            question.answers.push({
              placeholder: 'Enter an answer',
              text: '',
              isCorrect: false
            });
            return;
          }
          break;
        case 'truefalse':
          if (index == this.mockQuestionsAnswer.length - 1) {
            this.mockQuestionsAnswer.push({
              type: 'truefalse',
              placeholder: 'Enter next question',
              text: '',
              isTrue: false
            });
          }
          break;
      }
    }
  
    onAnswerTextareaKeyup(index: number, answers: any[]) {
      if (index == answers.length - 1) {
        answers.push({
          placeholder: 'Enter next answer',
          text: ''
        });
      }
    }
  
    onTrueFalseIconClick(question, isTrueIcon: boolean) {
  
      if (isTrueIcon)
        question.isTrue = true;
      else
        question.isTrue = false;
    }
  
    onRemoveQAClick(qa) {
      this.questionsAnswer.remove(qa);
    }
  
    onRemoveQTFClick(qtf) {
      this.questionsTrueFalse.remove(qtf);
    }
  
    onSegmentClick() {
      this.isAddActive = false;
    }
  
    onDismissClick() {
      this.isAddActive = false;
  
      for (let question of this.mockQuestionsAnswer) {
        if (question.type == 'answer') {
          let mockAnswers = [];
          for (let answer of question.answers) {
            if (answer.text.length > 0)
              mockAnswers.push({
                text: answer.text,
                isCorrect: answer.isCorrect ? true : false
              });
          }
          
          if (question.text.length > 0)
            this.questionsAnswer.push({ text: question.text, answers: mockAnswers });
        }
        else 
          if (question.text.length > 0)
            this.questionsTrueFalse.push({ text: question.text, isTrue: question.isTrue });
      }
  
    }
}
