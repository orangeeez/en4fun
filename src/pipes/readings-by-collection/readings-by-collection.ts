import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
@Pipe({
  name: 'readingsByCollection',
})
export class ReadingsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) { }

  transform(value, search: string) {
    search = search.toLowerCase();
    let readings = [];
    for (let readingKey of Object.keys(value.val()))
      if (readingKey.includes(search)) {
        let ref = this.afDB.object(`/readings/${readingKey}`)
          ref.subscribe(reading => {
            readings.push(reading);
          });
          ref.$ref.on('child_changed', child => {
            let index = readings.findIndex(obj => obj.$key == child.ref.parent.key);
            readings.splice(index, 1);
          });
        }
    return readings;
  }
}
