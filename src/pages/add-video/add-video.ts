import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { AngularFireAuth } from 'angularfire2/auth';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player'
import YouTube from 'simple-youtube-api';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-add-video',
  templateUrl: 'add-video.html',
})
export class AddVideoPage {
  user: firebase.User;
  youtube: any;
  video: any;
  playlistName: string;
  playlistVideos: any[];
  searchVideos: any[]; 
  collectionKeys: FirebaseListObservable<any[]>;
  search: string;
  timeout: any;
  checkedVideos: any[] = [];
  selectedCollection: any = '';
  selectedVideoCollection: FirebaseListObservable<any[]>;
  constructor(
    public platform: Platform,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    public youtubePlayer: YoutubeVideoPlayer) {
      this.user = this.afAuth.auth.currentUser;
      this.video = this.navParams.get('video');
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
                    this.playlistVideos = videos;
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
