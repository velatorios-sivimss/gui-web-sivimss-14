import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayPanelOpcionesComponent} from './components/overlay-panel-opciones/overlay-panel-opciones.component';
import {OverlayPanelOpcionComponent} from "./components/overlay-panel-opcion/overlay-panel-opcion.component";

@NgModule({
  declarations: [
    OverlayPanelOpcionesComponent,
    OverlayPanelOpcionComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OverlayPanelOpcionesComponent,
    OverlayPanelOpcionComponent
  ]
})
export class OverlayPanelOpcionesModule {
}
