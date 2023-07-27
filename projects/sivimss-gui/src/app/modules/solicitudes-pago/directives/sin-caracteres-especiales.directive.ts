import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appSinCaracteresEspeciales]'
})
export class SinCaracteresEspecialesDirective {

  @Output() valueChange: EventEmitter<any> = new EventEmitter()

  constructor(private _el: ElementRef) {
  }

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/^[^a-zA-Z0-9!¡?"=)(&%$#|¬*¨}\][{^<>+¿'_@:;.-]+$/g, '');
    newValue = newValue.replace(/\s+/g, ' ');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
