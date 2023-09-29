import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtapaComponent } from './components/etapa/etapa.component';
import { EtapasComponent } from './components/etapas/etapas.component';
import { EtapasActualizacionComponent } from './components/etapas-actualizacion/etapas-actualizacion.component';
import {EtapasConvenioSfpaComponent} from "./components/etapas-convenio-sfpa/etapas-convenio-sfpa";


@NgModule({
  declarations: [
    EtapaComponent,
    EtapasComponent,
    EtapasActualizacionComponent,
    EtapasConvenioSfpaComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EtapasComponent,
    EtapasActualizacionComponent,
    EtapasConvenioSfpaComponent
  ]
})
export class EtapasModule {
}
