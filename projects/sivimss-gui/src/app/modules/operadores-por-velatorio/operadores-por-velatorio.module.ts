import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";


import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import {MultiSelectModule} from 'primeng/multiselect';
import {
  OperadoresPorVelatorioComponent
} from "./components/operadores-por-velatorio/operadores-por-velatorio.component";
import {
  AgregarOperadoresPorVelatorioComponent
} from "./components/agregar-operadores-por-velatorio/agregar-operadores-por-velatorio.component";
import {
  ModificarOperadoresPorVelatorioComponent
} from "./components/modificar-operadores-por-velatorio/modificar-operadores-por-velatorio.component";
import {
  DetalleOperadoresPorVelatorioComponent
} from "./components/detalle-operadores-por-velatorio/detalle-operadores-por-velatorio.component";
import {OperadoresPorVelatorioRoutingModule} from "./operadores-por-velatorio-routing.module";
import {OperadoresPorVelatorioService} from "./services/operadores-por-velatorio.service";



@NgModule({
  declarations:[
    OperadoresPorVelatorioComponent,
    AgregarOperadoresPorVelatorioComponent,
    ModificarOperadoresPorVelatorioComponent,
    DetalleOperadoresPorVelatorioComponent
  ],
  imports:[
    CommonModule,
    OperadoresPorVelatorioRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    CalendarModule,
    MultiSelectModule
  ],
  providers:[
    OperadoresPorVelatorioService
  ]
})


export class OperadoresPorVelatorioModule{

}
