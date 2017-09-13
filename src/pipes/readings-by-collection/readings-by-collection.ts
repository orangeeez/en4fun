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
      if (readingKey.includes(search))
        this.afDB.object(`/readings/${readingKey}`)
          .subscribe(reading => {
            readings.push(reading);
          });

    return readings;
  }
}
