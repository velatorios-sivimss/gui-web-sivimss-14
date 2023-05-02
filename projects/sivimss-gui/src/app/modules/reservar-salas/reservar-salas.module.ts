import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReservarSalasRoutingModule} from './reservar-salas-routing.module';
import {ReservarSalasComponent} from './components/reservar-salas/reservar-salas.component';
import {TituloPrincipalModule} from '../../shared/titulo-principal/titulo-principal.module';
import {ListadoSalasComponent} from './components/listado-salas/listado-salas.component';

import {CalendarioSalasComponent} from './components/calendario-salas/calendario-salas.component';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TableModule} from 'primeng/table';
import {VerActividadSalasComponent} from './components/ver-actividad-salas/ver-actividad-salas.component';
import {TabViewModule} from 'primeng/tabview';
import {RegistrarEntradaComponent} from './components/registrar-entrada/registrar-entrada.component';
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {CalendarModule} from "primeng/calendar";
import { RegistrarSalidaComponent } from './components/registrar-salida/registrar-salida.component';
import {FullCalendarModule} from "@fullcalendar/angular";
import {AccordionModule} from "primeng/accordion";
import {ReservarSalasService} from "./services/reservar-salas.service";
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {InputNumberModule} from "primeng/inputnumber";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

@NgModule({
  declarations: [
    ReservarSalasComponent,
    ListadoSalasComponent,
    CalendarioSalasComponent,
    VerActividadSalasComponent,
    RegistrarEntradaComponent,
    RegistrarSalidaComponent,
  ],
  imports: [
    CommonModule,
    DropdownModule,
    ReservarSalasRoutingModule,
    SelectButtonModule,
    TableModule,
    TabViewModule,
    TituloPrincipalModule,
    FormsModule,
    TablePanelModule,
    ReactiveFormsModule,
    CalendarModule,
    FullCalendarModule,
    AccordionModule,
    UtileriaModule,
    InputNumberModule,
    ValidaRolModule
  ],
  providers: [
    ReservarSalasService
  ]

})
export class ReservarSalasModule {
}
