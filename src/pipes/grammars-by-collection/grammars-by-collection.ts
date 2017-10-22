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

    transform(value, search: string, collectionKey: string, segment: string, trainings: string[]) {
      let grammars = [];

      if (!trainings)
        trainings = ['constructor', 'insertion'];

      if (search)
        search = search.toLowerCase();

      if (value == null)
        return;

      if (value && collectionKey) { 
        for (let grammarKey of value) {
          let ref = this.afDB.object(`/grammars/${grammarKey.$key}`);
          ref.subscribe(grammar => {
            if (trainings)
              for (let training of trainings)
                this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/grammar/collections/${collectionKey}/${training}/${grammarKey.$key}`)
                  .subscribe(isLearned => {
                    switch (training) {
                      case 'constructor':
                        grammar['constructorLearned'] = isLearned.$value;
                      break;
                      case 'insertion':
                        grammar['insertionLearned'] = isLearned.$value;
                      break;
                    }

                    if (grammars.filter(g => g.$key == grammar.$key).length == 0) {
                      // PUSH IF NOT LEARNED FOR TRAINING
                      if (segment == 'training')
                        switch (training) {
                          case 'constructor' :
                            if (!grammar.constructorLearned)
                              grammars.push(grammar);
                          break;
                          case 'insertion' :
                            if (!grammar.insertionLearned)
                              grammars.push(grammar);
                          break;
                        }

                      // PUSH IF NOT TRAINING
                      if (segment == 'content')
                        grammars.push(grammar);
                    }
                  });
                  
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
