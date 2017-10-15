import { Directive, Input, ElementRef, OnChanges } from '@angular/core';

@Directive({
  selector: '[instanceValue]',
  exportAs: 'instanceValue'  
})
export class GrammarValueDirective implements OnChanges{
    @Input() instanceValue: any;
    constructor(private elementRef: ElementRef) {}

    ngOnChanges(): any {
      this.elementRef.nativeElement.value = this.instanceValue;
    }
}
