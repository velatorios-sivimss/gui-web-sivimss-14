import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appEstilosCeldaSticky]'
})
export class EstilosCeldaStickyDirective {

  constructor(private el: ElementRef<HTMLDivElement>, private renderer: Renderer2) {
  }

  @Input() set appEstilosCeldaSticky(estilos: any) {
    for (const keyEstilo in estilos) {
      this.renderer.setStyle(this.el.nativeElement, keyEstilo, estilos[keyEstilo]);
    }
  }

}
