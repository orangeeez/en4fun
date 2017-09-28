import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';

@Component({
  selector: 'page-video',
  templateUrl: 'video.html',
})
export class VideoPage {
  video: any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public youtubePlayer: YoutubeVideoPlayer) {
      this.video = this.navParams.get('video');
    }

    onPlayVideoClick(id: string) {
      this.youtubePlayer.openVideo(id);
    }
}
