import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: 'input[appRegexFolioFiscal]'
})
export class RegexFolioFiscalDirective {

  @Output() valueChange: EventEmitter<any> = new EventEmitter()

  constructor(private _el: ElementRef) {
  }

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/[^\dA-ZÑ\-\s]+/g, '');
    newValue = newValue.replace(/\s+/g, ' ');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
