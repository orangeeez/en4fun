import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";

@Pipe({
  name: 'imageByKey',
})
export class ImageByKeyPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) {}
  transform(value, type: string) {    
    if (type == 'student')
      return this.afDB.object(`/students/${value.$key}/imageURL`);
    else
      return this.afDB.object(`/teachers/${value.$key}/imageURL`);
  }
}
