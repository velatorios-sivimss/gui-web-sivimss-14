import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { MapaContratarConvenioPrevisionFunerariaRoutingModule } from './mapa-contratar-convenio-prevision-funeraria-routing.module';
import { MapaContratarConvenioPrevisionFunerariaComponent } from './mapa-contratar-convenio-prevision-funeraria.component';

@NgModule({
  declarations: [MapaContratarConvenioPrevisionFunerariaComponent],
  imports: [
    CommonModule,
    MapaContratarConvenioPrevisionFunerariaRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
  ],
})
export class MapaContratarConvenioPrevisionFunerariaModule {}
