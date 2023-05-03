import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng-lts/dropdown';
import { DynamicDialogModule } from 'primeng-lts/dynamicdialog';
import { TableModule } from 'primeng-lts/table';
import { InputSwitchModule } from 'primeng-lts/inputswitch';
import { OverlayPanelModule } from 'primeng-lts/overlaypanel';

import { TituloPrincipalModule } from '../../../shared/titulo-principal/titulo-principal.module';
import { TablePanelModule } from '../../../shared/table-panel/table-panel.module';
import { OverlayPanelOpcionesModule } from '../../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { DialogModule } from 'primeng-lts/dialog';
import { StepsModule } from 'primeng-lts/steps';
import { AutoCompleteModule } from 'primeng-lts/autocomplete';

import { CalendarModule } from 'primeng-lts/calendar';
import { AccordionModule } from 'primeng-lts/accordion';
import { GenerarFormatoPagareComponent } from './components/generar-formato-pagare/generar-formato-pagare.component';
import { GenerarFormatoPagareService } from './services/generar-formato-pagare.service';
import { GenerarReciboRoutingModule } from './generar-formato-pagare.routing.module';
import { ReciboFormatoPagareComponent } from './components/recibo-formato-pagare/recibo-formato-pagare.component';
import { UtileriaModule } from '../../../shared/utileria/utileria.module';

@NgModule({
  declarations: [
    GenerarFormatoPagareComponent,
    ReciboFormatoPagareComponent
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
  providers: [GenerarFormatoPagareService]
})
export class GenerarFormatoPagareModule { }
