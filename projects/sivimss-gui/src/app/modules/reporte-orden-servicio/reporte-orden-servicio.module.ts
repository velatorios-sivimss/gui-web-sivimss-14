import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgModule} from "@angular/core";

import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import { DialogModule } from 'primeng/dialog';
import {DropdownModule} from "primeng/dropdown";
import {DialogService, DynamicDialogModule} from "primeng/dynamicdialog";

import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

import {ReporteOrdenServicioComponent} from "./components/reporte-orden-servicio/reporte-orden-servicio.component";
import {ReporteOrdenServicioService} from "./services/reporte-orden-servicio.service";
import {ReporteOrdenServicioRoutingModule} from "./reporte-orden-servicio-routing.module";

@NgModule({
  declarations: [ReporteOrdenServicioComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReporteOrdenServicioRoutingModule,

    CalendarModule,
    CheckboxModule,
    DialogModule,
    DynamicDialogModule,
    DropdownModule,

    BtnRegresarModule,
    TituloPrincipalModule,
    UtileriaModule,
    ValidaRolModule

  ],
  providers: [
    ReporteOrdenServicioService,
    DialogService
  ],
})
export class ReporteOrdenServicioModule{}
