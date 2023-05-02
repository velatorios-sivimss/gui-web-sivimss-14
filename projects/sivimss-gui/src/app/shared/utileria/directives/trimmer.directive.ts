import { Directive, ElementRef, HostListener, Output, EventEmitter, Renderer2 } from '@angular/core';

@Directive({
  selector: 'input[trimmer]',
})

export class TrimmerDirective {
  @Output() ngModelChange = new EventEmitter();

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef) {
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value: any): void {
    const valueToProcess = value.trim();
    this._renderer.setProperty(this._elementRef.nativeElement, "value", valueToProcess);
    this.ngModelChange.emit(valueToProcess);
  }
}