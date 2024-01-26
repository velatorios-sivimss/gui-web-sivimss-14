import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { MapaContratarConvenioPrevisionFunerariaRoutingModule } from './mapa-contratar-convenio-prevision-funeraria-routing.module';
import { MapaContratarConvenioPrevisionFunerariaComponent } from './mapa-contratar-convenio-prevision-funeraria.component';
import {FormsModule} from "@angular/forms";
import {MapaContratatarConvenioPfService} from "./services/mapa-contratatar-convenio-pf.service";

@NgModule({
  declarations: [MapaContratarConvenioPrevisionFunerariaComponent],
  imports: [
    CommonModule,
    MapaContratarConvenioPrevisionFunerariaRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    FormsModule,
  ],
  providers: [
    MapaContratatarConvenioPfService
  ]
})
export class MapaContratarConvenioPrevisionFunerariaModule {}
