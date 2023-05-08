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
import {DialogModule} from "primeng/dialog";
import { PagoOrdenServicioComponent } from './components/pago-orden-servicio/pago-orden-servicio.component';
import { PagoConvenioComponent } from './components/pago-convenio/pago-convenio.component';
import { PagoRenovacionConvenioComponent } from './components/pago-renovacion-convenio/pago-renovacion-convenio.component';


@NgModule({
  declarations: [
    RealizarPagoComponent,
    PagoOrdenServicioComponent,
    PagoConvenioComponent,
    PagoRenovacionConvenioComponent
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
    OverlayPanelOpcionesModule,
    DialogModule
  ]
})
export class RealizarPagoModule { }
