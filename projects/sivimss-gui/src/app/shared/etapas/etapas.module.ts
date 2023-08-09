import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtapaComponent } from './components/etapa/etapa.component';
import { EtapasComponent } from './components/etapas/etapas.component';
import { EtapasActualizacionComponent } from './components/etapas-actualizacion/etapas-actualizacion.component';


@NgModule({
  declarations: [
    EtapaComponent,
    EtapasComponent,
    EtapasActualizacionComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EtapasComponent,
    EtapasActualizacionComponent
  ]
})
export class EtapasModule {
}
