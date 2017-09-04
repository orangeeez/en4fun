import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
@Pipe({
  name: 'isHasTeacher',
})
export class IsHasTeacherPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase) {}
  transform(value) {
    let students = [];
    if (value)
      for (let studentKey of value)
        this.afDB.object(`/students/${studentKey.$key}/teacher`)
          .subscribe(teacherKey => {
            if (teacherKey.$exists()) {
              let index = students.indexOf(studentKey);
              students.splice(index, 1);
            }
            else 
              students.push(studentKey);
          });

          return students;
  }
}
