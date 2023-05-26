import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlVehiculosRoutingModule } from './control-vehiculos-routing.module';
import { ControlVehiculosComponent } from './components/control-vehiculos/control-vehiculos.component';
import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { ListadoVehiculosComponent } from './components/listado-vehiculos/listado-vehiculos.component';

import { CalendarioVehiculosComponent } from './components/calendario-vehiculos/calendario-vehiculos.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { VerActividadVehiculosComponent } from './components/ver-actividad-vehiculos/ver-actividad-vehiculos.component';
import { TabViewModule } from 'primeng/tabview';
import { RegistrarEntradaComponent } from './components/registrar-entrada/registrar-entrada.component';
import { TablePanelModule } from "../../shared/table-panel/table-panel.module";
import { CalendarModule } from "primeng/calendar";
import { RegistrarSalidaComponent } from './components/registrar-salida/registrar-salida.component';
import { FullCalendarModule } from "@fullcalendar/angular";
import { AccordionModule } from "primeng/accordion";
import { ControlVehiculosService } from "./services/control-vehiculos.service";
import { UtileriaModule } from "../../shared/utileria/utileria.module";
import { InputNumberModule } from "primeng/inputnumber";
import { ValidaRolModule } from "../../shared/valida-rol/valida-rol.module";

@NgModule({
  declarations: [
    ControlVehiculosComponent,
    ListadoVehiculosComponent,
    CalendarioVehiculosComponent,
    VerActividadVehiculosComponent,
    RegistrarEntradaComponent,
    RegistrarSalidaComponent,
  ],
  imports: [
    CommonModule,
    DropdownModule,
    ControlVehiculosRoutingModule,
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
    ControlVehiculosService
  ]

})
export class ControlVehiculosModule {
}
