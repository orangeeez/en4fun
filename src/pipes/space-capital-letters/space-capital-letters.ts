import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceCapitalLetters',
})

export class SpaceCapitalLettersPipe implements PipeTransform {
  transform(value) {
    return value.replace(/([A-Z])/g, ' $1').trim()
  }
}
