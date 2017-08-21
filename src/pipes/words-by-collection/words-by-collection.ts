import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Pipe({
  name: 'wordsByCollection',
})
export class WordsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) { }

  transform(value, search: string) {
    search = search.toLowerCase();
    let words = [];
    for (let wordKey of Object.keys(value.val()))
      if (wordKey.includes(search))
        words.push(this.afDB.object(`/words/${wordKey}`));

    return words;
  }
}
