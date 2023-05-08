import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealizarPagoRoutingModule } from './realizar-pago-routing.module';
import { RealizarPagoComponent } from './components/realizar-pago/realizar-pago.component';
import {TituloPrincipalModule} from "../../../shared/titulo-principal/titulo-principal.module";
import {ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {UtileriaModule} from "../../../shared/utileria/utileria.module";
import {ValidaRolModule} from "../../../shared/valida-rol/valida-rol.module";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../../shared/overlay-panel-opciones/overlay-panel-opciones.module";


@NgModule({
  declarations: [
    RealizarPagoComponent
  ],
  imports: [
    CommonModule,
    RealizarPagoRoutingModule,
    TituloPrincipalModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    UtileriaModule,
    ValidaRolModule,
    TableModule,
    InputSwitchModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule
  ]
})
export class RealizarPagoModule { }
