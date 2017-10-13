import { Directive, Input, ElementRef, OnChanges } from '@angular/core';

@Directive({
  selector: '[grammarValue]',
  exportAs: 'grammarValue'  
})
export class GrammarValueDirective implements OnChanges{
    @Input() grammarValue: any;
    constructor(private elementRef: ElementRef) {}

    ngOnChanges(): any {
      this.elementRef.nativeElement.value = this.grammarValue;
    }
}
