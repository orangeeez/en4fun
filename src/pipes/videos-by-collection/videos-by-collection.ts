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
  transform(value, search, collection) {
    var videos = [];

    if (search)
      search = search.toLowerCase();
    
    if (collection) {
      value.subscribe(videoKeys => {
        videos.splice(0, videos.length);
        videoKeys.forEach(videoKey => {
          this.youtube.getVideoByID(videoKey.$value)
            .then(video => {
              console.log(video.title);
              // if (video.title.toLowerCase().includes(search))    
                videos.push(video);
            });
        });
      });
    }
      
    else {
      value.val().forEach((id, key) => {
        this.youtube.getVideoByID(id)
          .then(video => {
            if (video.title.toLowerCase().includes(search)) {
              video['key'] = key;
              videos.push(video);
            }
          });
      });
    }
    return videos;
  }
}
