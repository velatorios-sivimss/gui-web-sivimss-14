import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: 'input[folioOdsAlphanumeric]'
})
export class FolioODSAlphanumericDirective {

  @Output() valueChange = new EventEmitter()
  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/[^a-zA-Z0-9-]+/g, '');
    newValue = newValue.replace(/\s+/g, ' ');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}