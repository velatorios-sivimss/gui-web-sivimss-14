import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import {ServiciosRoutingModule} from "./servicios-routing.module";

import {ServiciosComponent} from "./components/servicios/servicios.component";
import {ServicioService} from "./services/servicio.service";
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";

import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DynamicDialogModule } from 'primeng/dynamicdialog';

import { AgregarServicioComponent } from './components/agregar-servicio/agregar-servicio.component';
import { ModificarServicioComponent } from './components/modificar-servicio/modificar-servicio.component';
import { DetalleServicioComponent } from './components/detalle-servicio/detalle-servicio.component';

@NgModule({
  declarations:[
    ServiciosComponent,
    AgregarServicioComponent,
    ModificarServicioComponent,
    DetalleServicioComponent
  ],
  imports:[
    CommonModule,
    ServiciosRoutingModule,
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
    CeldaStickyModule
  ],
  providers:[
    ServicioService
  ]
})


export class ServiciosModule{

}
