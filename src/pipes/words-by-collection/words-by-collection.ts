import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Pipe({
  name: 'wordsByCollection',
})
export class WordsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) { }

  transform(value) {
    let words = [];
    for (let wordKey of Object.keys(value.val()))
      words.push(this.afDB.object(`/words/${wordKey}`));
    return words;
  }
}
