import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { TituloPrincipalModule } from '../../../shared/titulo-principal/titulo-principal.module';
import { TablePanelModule } from '../../../shared/table-panel/table-panel.module';
import { OverlayPanelOpcionesModule } from '../../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { GenerarReciboPagoComponent } from './components/generar-recibo-pago/generar-recibo-pago.component';
import { GenerarReciboService } from './services/generar-recibo-pago.service';
import { GenerarReciboRoutingModule } from './generar-recibo-pago.routing.module';
import { ReciboPagoTramitesComponent } from './components/recibo-pago-tramites/recibo-pago-tramites.component';
import { UtileriaModule } from '../../../shared/utileria/utileria.module';

@NgModule({
  declarations: [
    GenerarReciboPagoComponent,
    ReciboPagoTramitesComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    GenerarReciboRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule,
    AutoCompleteModule,
    UtileriaModule,
  ],
  providers: [GenerarReciboService]
})
export class GenerarReciboModule { }
