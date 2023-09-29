import {Directive, ElementRef, Input, OnChanges, Renderer2} from '@angular/core';

@Directive({
  selector: '[appTextColor]'
})
export class TextColorDirective implements OnChanges {

  @Input('appTextColor') status!: string;

  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnChanges() {
    switch (this.status) {
      case 'EN TIEMPO':
        this.renderer.setStyle(this.el.nativeElement, 'color', '#217A6B');
        break;
      case 'CERCANO':
        this.renderer.setStyle(this.el.nativeElement, 'color', '#FFC700');
        break;
      case 'FINALIZADO':
        this.renderer.setStyle(this.el.nativeElement, 'color', '#E10000');
        break;
      case 'ACTIVO':
        this.renderer.setStyle(this.el.nativeElement, 'color', '#217A6B');
        break;
      case 'VENCE HOY':
        this.renderer.setStyle(this.el.nativeElement, 'color', "blue");
        break;
      default:
        this.renderer.setStyle(this.el.nativeElement, 'color', '#000');
        break;
    }
    this.renderer.setStyle(this.el.nativeElement, 'font-weight', '600');
  }
}
