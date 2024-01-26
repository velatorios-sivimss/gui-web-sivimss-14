import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule } from './contratar-plan-servicios-funerarios-pago-anticipado-routing.module';
import { ContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './contratar-plan-servicios-funerarios-pago-anticipado.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { OverlayPanelOpcionesModule } from 'projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { DialogService } from 'primeng/dynamicdialog';
import { CeldaStickyModule } from 'projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module';
import { ContratarPSFPAService } from '../../services/contratar-psfpa.service';

@NgModule({
  declarations: [ContratarPlanServiciosFunerariosPagoAnticipadoComponent],
  imports: [
    CommonModule,
    ContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
    CheckboxModule,
    RadioButtonModule,
    OverlayPanelOpcionesModule,
    OverlayPanelModule,
    DialogModule,
    CeldaStickyModule
  ],
  providers:[
    DialogService,
    ContratarPSFPAService,
  ]
})
export class ContratarPlanServiciosFunerariosPagoAnticipadoModule {}
