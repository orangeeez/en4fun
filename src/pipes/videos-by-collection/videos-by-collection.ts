import { Pipe, PipeTransform } from '@angular/core';
import YouTube from "simple-youtube-api";
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";

@Pipe({
  name: 'videosByCollection',
})
export class VideosByCollectionPipe implements PipeTransform {
  youtube: any;
  constructor(
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
      this.youtube = new YouTube('AIzaSyAkcmdXMPyklcO0Te2Dcl1BjSELCdJ86ms');
  }
  transform(value, search, collectionKey: string) {
    var videos = [];

    if (search)
      search = search.toLowerCase();

    if (!value)
      return;
    
    if (value && collectionKey) {
      value.subscribe(videoKeys => {
        videoKeys.forEach(videoKey => {
          this.youtube.getVideoByID(videoKey.$value)
            .then(video => {
              let ref = this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/video/collections/${collectionKey}/${videoKey.$value}/coefficient`)
              ref.subscribe(coefficient => {
                let index = videos.findIndex(obj => obj.$key == videoKey.$key);
                if (index != -1)
                  videos.splice(index, 1);

                video['coefficient'] = coefficient.$value;

                if (coefficient.$exists())
                  videos.push(video);
                else
                  videos.unshift(video);
              });
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
