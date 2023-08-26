import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[withoutSpecialChar]'
})
export class WithoutSpecialCharDirective {

  @Output() valueChange: EventEmitter<any> = new EventEmitter()

  constructor(private _el: ElementRef, private ngControl: NgControl) {
  }

  @HostListener('blur') onBlur(): void {
    const value = this._el.nativeElement.value;
    this._el.nativeElement.value = value.trim();
  }

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/^ +/g, '');
    newValue = newValue.replace(/[^a-zA-Z0-9\s]/gi, '');
    newValue = newValue.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    newValue = newValue.replace(/\s+/g, ' ');
    if (newValue === '' && this.ngControl?.control) {
      this.ngControl.control.setErrors({required: true});
    }

    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
