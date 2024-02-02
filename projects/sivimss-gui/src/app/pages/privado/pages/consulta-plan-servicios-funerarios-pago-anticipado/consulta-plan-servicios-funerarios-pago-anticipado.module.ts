import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsultaPlanServiciosFunerariosPagoAnticipadoRoutingModule } from './consulta-plan-servicios-funerarios-pago-anticipado-routing.module';
import { ConsultaPlanServiciosFunerariosPagoAnticipadoComponent } from './consulta-plan-servicios-funerarios-pago-anticipado.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { CeldaStickyModule } from 'projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { ContratarPSFPAService } from '../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/contratar-psfpa.service';

@NgModule({
  declarations: [ConsultaPlanServiciosFunerariosPagoAnticipadoComponent],
  imports: [
    CommonModule,
    ConsultaPlanServiciosFunerariosPagoAnticipadoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
    CeldaStickyModule,
    DialogModule,
  ],
  providers: [
    DialogService,
    ContratarPSFPAService,
  ],
})
export class ConsultaPlanServiciosFunerariosPagoAnticipadoModule { }
