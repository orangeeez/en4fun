import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Pipe({
  name: 'collectionsByType',
})
export class CollectionsByTypePipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) { }

  transform(value, limit: number, studentKey: any) {
    if (!studentKey)
      return this.afDB.list(`/collections/${value.$key}`, {
        query: {
          limitToLast: limit
        }
      });
    else {
      let collections = [];
      let ref = this.afDB.list(`/students/${studentKey}/collections/${value.$key}`, {
        query: {
          limitToLast: limit
        }
      });
      ref.subscribe(typeCollections => {
        typeCollections.forEach(type => {
          this.afDB.object(`/collections/${value.$key}/${type.$key}`)
            .subscribe(collection => {
              if (collections.filter(obj => obj.$key == collection.$key).length == 0)
                // console.log(collections);
                collections.push(collection);
            });
        });
      });
      ref.$ref.on('child_removed', child => {
        let index = collections.findIndex(obj => obj.$key == child.key);
        collections.splice(index, 1);
      });
      return collections;
    }
  }
}
