import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitByWord',
})

export class SplitByWordPipe implements PipeTransform {
  transform(value: any) {
    let text = value.split(" ");
    let isTag;
    for (let i = 0; i < text.length; i++) {
      // If element in array is tag, join until tag will be closed
      if (isTag) {
        if (text[i].includes('</img>') || 
            text[i].includes('</blockquote>')) 
          isTag = false;

        var removed = text.splice(i, 1);
        text[--i] += ' ' + removed[0];
        continue;
      }
      // Check if element in array is HTML tag
      if (text[i].includes('<img') ||
          text[i].includes('<blockquote>'))
        isTag = true;
    }
    return text;
  }
}
