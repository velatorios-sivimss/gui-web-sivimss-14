import { Directive, HostBinding, Inject } from '@angular/core';
import { TIEMPO_TRANSICION } from "projects/sivimss-gui/src/app/shared/sidebar/tokens/sidebar.tokens";

@Directive({
  selector: '[appTiempoTransicion]'
})
export class TiempoTransicionDirective {

  constructor(@Inject(TIEMPO_TRANSICION) private tiempoTransicionToken: number) {
  }

  @HostBinding('style.transition') get tiempoTransicion(): string {
    return `${this.tiempoTransicionToken}s ease-in-out`;
  }

}
