import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapaContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule } from './mapa-contratar-plan-servicios-funerarios-pago-anticipado-routing.module';
import { MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { FormsModule } from "@angular/forms";
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { MapaContratatarPSFPAService } from "./services/mapa-contratatar-psfpa.service";

@NgModule({
  declarations: [MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent],
  imports: [
    CommonModule,
    MapaContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    FormsModule,
  ],
  providers: [
    MapaContratatarPSFPAService
  ]
})
export class MapaContratarPlanServiciosFunerariosPagoAnticipadoModule { }
