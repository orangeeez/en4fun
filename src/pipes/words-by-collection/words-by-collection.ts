import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from "angularfire2/auth";

@Pipe({
  name: 'wordsByCollection',
})
export class WordsByCollectionPipe implements PipeTransform {
  constructor(
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) { }

  transform(value, search: string, collectionKey: string, segment: string, trainings: string[]) {
    let words = [];

    if (!trainings)
      trainings = ['constructor', 'wordtranslation', 'translationword'];

    if (search)
      search = search.toLowerCase();

    if (value == null)
      return;

    if (value && collectionKey) {
      for (let wordKey of value) {
        let ref = this.afDB.object(`/words/${wordKey.$key}`);
        ref.subscribe(word => {
          if (trainings)
            for (let training of trainings)
              this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/vocabulary/collections/${collectionKey}/${training}/${wordKey.$key}`)
                .subscribe(isLearned => {
                  switch (training) {
                    case 'constructor':
                      word['constructorLearned'] = isLearned.$value;
                      break;
                    case 'wordtranslation':
                      word['wordtranslationLearned'] = isLearned.$value;
                      break;
                    case 'translationword':
                      word['translationwordLearned'] = isLearned.$value;
                      break;
                  }

                  if (words.filter(g => g.$key == word.$key).length == 0) {
                    // PUSH IF NOT LEARNED FOR TRAINING
                    if (segment == 'training')
                      switch (training) {
                        case 'constructor':
                          if (!word.constructorLearned)
                            words.push(word);
                          break;
                        case 'wordtranslation':
                          if (!word.wordtranslationLearned)
                            words.push(word);
                          break;
                        case 'translationword':
                          if (!word.translationwordLearned)
                            words.push(word);
                          break;
                        }

                    // PUSH IF NOT TRAINING
                    if (segment == 'content')
                      words.push(word);
                  }
                });
        });
        ref.$ref.on('child_removed', child => {
          let index = words.findIndex(obj => obj.$key == child.ref.parent.key);
          if (index != -1)
            words.splice(index, 1);
        });
      }
    }
    else {
      for (let wordKey of Object.keys(value.val()))
        if (wordKey.includes(search))
          this.afDB.object(`/words/${wordKey}`)
            .subscribe(word => {
              words.push(word);
            });
    }
    return words;
  }
}
