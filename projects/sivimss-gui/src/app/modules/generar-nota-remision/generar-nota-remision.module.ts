import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { TablePanelModule } from '../../shared/table-panel/table-panel.module';
import { OverlayPanelOpcionesModule } from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { GenerarNotaRemisionComponent } from './components/generar-nota-remision/generar-nota-remision.component';
import { GenerarNotaRemisionService } from './services/generar-nota-remision.service';
import { GenerarReciboRoutingModule } from './generar-nota-remision.routing.module';
import { FormatoGenerarNotaRemisionComponent } from './components/formato-generar-nota-remision/formato-generar-nota-remision.component';
import { DetalleFormatoGenerarNotaRemisionComponent } from './components/detalle-formato-generar-nota-remision/detalle-formato-generar-nota-remision.component';
import { ModalNotaRemisionComponent } from './components/modal/modal-nota-remision/modal-nota-remision.component';
import { CancelarFormatoGenerarNotaRemisionComponent } from './components/cancelar-formato-generar-nota-remision/cancelar-formato-generar-nota-remision.component';
import { LoaderModule } from '../../shared/loader/loader.module';

@NgModule({
  declarations: [
    GenerarNotaRemisionComponent,
    FormatoGenerarNotaRemisionComponent,
    DetalleFormatoGenerarNotaRemisionComponent,
    CancelarFormatoGenerarNotaRemisionComponent,
    ModalNotaRemisionComponent,
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
    InputTextareaModule,
    LoaderModule,
  ],
  providers: [GenerarNotaRemisionService]
})
export class GenerarNotaRemisionModule { }
