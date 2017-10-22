import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";

@Pipe({
  name: 'readingsByCollection',
})
export class ReadingsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) { }

  transform(value, search: string, collectionKey: string, segment: string) {
    let readings = [];

    if (search)
      search = search.toLowerCase();

    if (!value)
      return;

    if (value && collectionKey) {
      for (let readingKey of value) {
        let ref = this.afDB.object(`readings/${readingKey.$key}`)
          ref.subscribe(reading => {
            this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/reading/collections/${collectionKey}/${readingKey.$key}`)
              .subscribe(isLearned => {
                reading['isLearned'] = isLearned.$value;

                if (reading.isLearned)
                  readings.push(reading);
                else
                  readings.unshift(reading);
              })
          });
      }
    }
    else {
      for (let readingKey of Object.keys(value.val()))
        if (readingKey.toLowerCase().includes(search)) {
          let ref = this.afDB.object(`/readings/${readingKey}`);
          ref.subscribe(reading => {
            readings.push(reading);
          });
          ref.$ref.on('child_changed', child => {
            let index = readings.findIndex(obj => obj.$key == child.ref.parent.key);
            if (index != -1)
              readings.splice(index, 1);
          });
        }
    }
    return readings;
  }
}
