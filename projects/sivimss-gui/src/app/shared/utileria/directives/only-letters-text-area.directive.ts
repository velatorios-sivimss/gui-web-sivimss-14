import {Directive, ElementRef, EventEmitter, HostListener, Output} from "@angular/core";

@Directive({
  selector: 'textarea[lettersOnly]'
})
export class LettersDirectiveTextArea {

  @Output() valueChange = new EventEmitter()
  constructor(private _el: ElementRef) { }

  @HostListener('keyup', ['$event']) onKeyup(event: any) {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/[^a-zA-ZñÑ\s]+/g, '');
    newValue = newValue.replace(/\s+/g, ' ');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
