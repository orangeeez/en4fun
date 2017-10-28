import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { AngularFireDatabase } from "angularfire2/database";
import { ReadingTrainingPage } from "../reading-training/reading-training";

@Component({
  selector: 'page-video',
  templateUrl: 'video.html',
})
export class VideoPage {
  collectionKey: string;
  studentKey: string;
  items: any[];
  video: any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public youtubePlayer: YoutubeVideoPlayer) {
      this.collectionKey = this.navParams.get('collectionKey');
      this.studentKey = this.navParams.get('studentKey');
      this.video = this.navParams.get('video');

      this.afDB.database.ref(`videoTexts/${this.video.id}`).once('value')
        .then(text => { 
          if (text.val())
            this.items = text.val().match(/<p>(.*?)<\/p>/g).map(function(value) {
              value = value.replace(/<\/?p>|<\/?p>/g, '');  
              return value;
            });
        });
    }

    onPlayVideoClick(id: string) {
      this.youtubePlayer.openVideo(id);
    }

    onTrainingClick() {
      this.navCtrl.push(ReadingTrainingPage, {
        collectionKey: this.collectionKey,
        studentKey: this.studentKey,
        video: this.video,
      })
    }
}
