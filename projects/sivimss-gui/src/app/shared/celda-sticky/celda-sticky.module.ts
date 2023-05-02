import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EstilosCeldaStickyDirective
} from 'projects/sivimss-gui/src/app/shared/celda-sticky/directives/estilos-celda-sticky.directive';
import {
  ActivarUltimaCeldaStickyDirective
} from 'projects/sivimss-gui/src/app/shared/celda-sticky/directives/activar-ultima-celda-sticky.directive';


@NgModule({
  declarations: [
    ActivarUltimaCeldaStickyDirective,
    EstilosCeldaStickyDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ActivarUltimaCeldaStickyDirective,
    EstilosCeldaStickyDirective
  ]
})
export class CeldaStickyModule {
}
