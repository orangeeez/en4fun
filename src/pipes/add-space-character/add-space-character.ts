import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaceCharacter',
})
export class AddSpaceCharacterPipe implements PipeTransform {
  transform(value) {
    return value + ' ';
  }
}
