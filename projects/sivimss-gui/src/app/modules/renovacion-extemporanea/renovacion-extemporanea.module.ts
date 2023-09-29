import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { OverlayPanelOpcionesModule } from 'projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from 'projects/sivimss-gui/src/app/shared/table-panel/table-panel.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { RenovacionExtemporaneaRoutingModule } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/renovacion-extemporanea-routing.module';
import { RenovacionExtemporaneaService } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/services/renovacion-extemporanea.service';
import { RenovacionExtemporaneaComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/renovacion-extemporanea/renovacion-extemporanea.component';
import { HabilitarRenovacionComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/habilitar-renovacion/habilitar-renovacion.component';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { ValidaRolModule } from '../../shared/valida-rol/valida-rol.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

//as
@NgModule({
  declarations: [
    RenovacionExtemporaneaComponent,
    HabilitarRenovacionComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    RenovacionExtemporaneaRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule,
    UtileriaModule,
    ValidaRolModule,
    ConfirmDialogModule,
  ],
  providers: [RenovacionExtemporaneaService]
})
export class RenovacionExtemporaneaModule { }
