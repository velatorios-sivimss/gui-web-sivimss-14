import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {TableModule} from "primeng/table";
import {StepsModule} from "primeng/steps";
import {SelectButtonModule} from "primeng/selectbutton";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {CheckboxModule} from "primeng/checkbox";

import {RenovarConvenioPfComponent} from "./components/renovar-convenios-pf/renovar-convenio-pf.component";
import {RenovarConvenioPfRoutingModule} from "./renovar-convenio-pf-routing.module";
import {RenovarConvenioPfService} from "./services/renovar-convenio-pf.service";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";




@NgModule({
  declarations: [
    RenovarConvenioPfComponent
  ],
  imports: [
    CommonModule,
    RenovarConvenioPfRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    TableModule,
    StepsModule,
    SelectButtonModule,
    CeldaStickyModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CheckboxModule,
  ],
  providers: [
    RenovarConvenioPfService
  ]

})



export class RenovarConvenioPfModule {}
