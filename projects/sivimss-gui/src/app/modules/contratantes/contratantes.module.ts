import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {DialogModule} from "primeng/dialog";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {StepsModule} from "primeng/steps";
import {CalendarModule} from "primeng/calendar";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import {ContratantesComponent} from "./components/contratantes/contratantes.component";
import {ContratantesRoutingModule} from "./contratantes-routing.module";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";
import {ContratantesService} from "./services/contratantes.service";
import { DetalleContratantesComponent } from './components/detalle-contratantes/detalle-contratantes.component';
import { ModificarContratantesComponent } from './components/modificar-contratantes/modificar-contratantes.component';
import { BtnRegresarModule } from "../../shared/btn-regresar/btn-regresar.module";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { UtileriaModule } from "../../shared/utileria/utileria.module";

@NgModule({
  declarations: [
    ContratantesComponent,
    DetalleContratantesComponent,
    ModificarContratantesComponent,
  ],
  imports:[
    CommonModule,
    ContratantesRoutingModule,
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
    StepsModule,
    CalendarModule,
    BtnRegresarModule,
    ConfirmDialogModule,
    UtileriaModule,
  ],
  providers:[
    ContratantesService
  ],
})
export class ContratantesModule {}
