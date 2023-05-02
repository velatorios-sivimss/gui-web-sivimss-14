import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtapaComponent } from './components/etapa/etapa.component';
import { EtapasComponent } from './components/etapas/etapas.component';


@NgModule({
  declarations: [
    EtapaComponent,
    EtapasComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EtapasComponent
  ]
})
export class EtapasModule {
}
