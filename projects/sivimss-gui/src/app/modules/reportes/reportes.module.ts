import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgModule} from "@angular/core";

import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from "primeng/dropdown";
import {DialogService, DynamicDialogModule} from "primeng/dynamicdialog";

import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

import {Reportes} from "./components/reportes/reportes";
import {ReportesService} from "./services/reportes.service";
import {ReportesRoutingModule} from "./reportes-routing.module";
import {AutoCompleteModule} from "primeng/autocomplete";

@NgModule({
  declarations: [Reportes],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportesRoutingModule,

    CalendarModule,
    CheckboxModule,
    DialogModule,
    DynamicDialogModule,
    DropdownModule,

    BtnRegresarModule,
    TituloPrincipalModule,
    UtileriaModule,
    ValidaRolModule,
    AutoCompleteModule,

  ],
  providers: [
    ReportesService,
    DialogService
  ],
})
export class ReportesModule {
}
