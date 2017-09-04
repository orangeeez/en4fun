import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";

@Pipe({
  name: 'dependencyByKey',
})
export class DependencyByKeyPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) {}
  transform(value, type) {
    if (type == 'student')
      return this.afDB.list(`/students/${value}/teacher`);
    else
      return this.afDB.list(`/teachers/${value}/students`);
  }
}
