import { Pipe, PipeTransform } from '@angular/core';
import YouTube from "simple-youtube-api";

@Pipe({
  name: 'videosByCollection',
})
export class VideosByCollectionPipe implements PipeTransform {
  youtube: any;
  constructor() {
    this.youtube = new YouTube('AIzaSyAkcmdXMPyklcO0Te2Dcl1BjSELCdJ86ms');
  }
  transform(value, collection) {
    var videos = [];
    
    if (collection) {
      value.subscribe(videoKeys => {
        videos.splice(0, videos.length);
        videoKeys.forEach(videoKey => {
          this.youtube.getVideoByID(videoKey.$value)
            .then(video => {
              videos.push(video);
            });
        })
      });
    }
      
    else {
      value.val().forEach((id, key) => {
        this.youtube.getVideoByID(id)
          .then(video => {
            video['key'] = key;
            videos.push(video);
          });
      });
    }
    return videos;
  }
}
