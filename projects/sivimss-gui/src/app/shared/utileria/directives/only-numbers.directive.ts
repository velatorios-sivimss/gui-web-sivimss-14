import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: 'input[numbersOnly]'
})
export class NumberDirective {

@Output() valueChange = new EventEmitter()
  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;
    const newValue = initalValue.replace(/\D*/g, '');
       this._el.nativeElement.value = newValue;
       this.valueChange.emit(newValue);
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
