import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";

@Pipe({
  name: 'grammarsByCollection',
})
export class GrammarsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {}

  transform(value, search: string, type: string, studentKey: string) {
    let grammars = [];

    if (search)
      search = search.toLowerCase();

    if (value == null)
      return;

    if (value && type) { 
      for (let grammarKey of value) {
        let ref = this.afDB.object(`/grammars/${grammarKey.$key}`);
        ref.subscribe(grammar => {
          let key = studentKey ? studentKey : this.afAuth.auth.currentUser['enemail'];

          this.afDB.object(`/students/${key}/collections/${type}/${grammarKey.key}`)
            .subscribe(isLearned => {
              grammar['isLearned'] = isLearned.$exists();
              grammars.push(grammar);
            })
        });
        ref.$ref.on('child_removed', child => {
          let index = grammars.findIndex(obj => obj.$key == child.ref.parent.key);
          if (index != -1)
            grammars.splice(index, 1);
        });
      }
    }
    else {
      for (let grammarKey of Object.keys(value.val())) { 
        let ref = this.afDB.object(`/grammars/${grammarKey}`);
        ref.subscribe(grammar => {
          if (grammar.sentence.toLowerCase().includes(search) ||
              grammar.translation.toLowerCase().includes(search))
            grammars.push(grammar);
        });
        ref.$ref.on('child_removed', child => {
          let index = grammars.findIndex(obj => obj.$key == child.ref.parent.key);
          if (index != -1)
            grammars.splice(index, 1);
        });
        ref.$ref.on('child_changed', child => {
          let index = grammars.findIndex(obj => obj.$key == child.ref.parent.key);
          if (index != -1)  
            grammars.splice(index, 1);
        });
      }
   }
      
    return grammars;
  }
}
