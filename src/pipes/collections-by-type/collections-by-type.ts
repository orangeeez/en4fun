import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Pipe({
  name: 'collectionsByType',
})
export class CollectionsByTypePipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) {}

  transform(value, limit: number, studentKey: any) {
    if (!studentKey)
      return this.afDB.list(`/collections/${value.$key}`, {
        query: {
          limitToLast: limit
        }
      });
    else {
      let collections = [];
      this.afDB.list(`/students/${studentKey}/collections/${value.$key}`)
        .subscribe(typeCollections => {
          typeCollections.forEach(type => {
            collections.push(this.afDB.object(`/collections/${value.$key}/${type.$key}`));
          });
        });
      return collections;
    }
    
    // let words = [];
    // for (let wordKey of Object.keys(value.val()))
    //   words.push(this.afDB.object(`/words/${wordKey}`));
    // return words;
  }
}
