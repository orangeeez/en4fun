import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseDate',
})
export class ParseDatePipe implements PipeTransform {
  transform(value) {
    return Date.parse(value);
  }
}
