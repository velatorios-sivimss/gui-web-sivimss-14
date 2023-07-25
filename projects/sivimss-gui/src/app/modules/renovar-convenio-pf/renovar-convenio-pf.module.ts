import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { StepsModule } from "primeng/steps";
import { SelectButtonModule } from "primeng/selectbutton";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { CheckboxModule } from "primeng/checkbox";

import { RenovarConvenioModificarBeneficiarioComponent } from './components/renovar-convenios-beneficiarios/renovar-convenio-modificar-beneficiario/renovar-convenio-modificar-beneficiario.component';
import { RenovarConvenioBeneficiariosComponent } from './components/renovar-convenios-beneficiarios/renovar-convenio-beneficiarios.component';
import { RenovarConvenioPfComponent } from "./components/renovar-convenios-pf/renovar-convenio-pf.component";
import { RenovarConvenioPfRoutingModule } from "./renovar-convenio-pf-routing.module";
import { RenovarConvenioPfService } from "./services/renovar-convenio-pf.service";
import { CeldaStickyModule } from "../../shared/celda-sticky/celda-sticky.module";
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { RenovarConvenioCrearBeneficiarioComponent } from './components/renovar-convenios-beneficiarios/renovar-convenio-crear-beneficiario/renovar-convenio-crear-beneficiario.component';
import { RenovarConvenioDesactivarBeneficiarioComponent } from './components/renovar-convenios-beneficiarios/renovar-convenio-desactivar-beneficiario/renovar-convenio-desactivar-beneficiario.component';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    RenovarConvenioPfComponent,
    RenovarConvenioBeneficiariosComponent,
    RenovarConvenioModificarBeneficiarioComponent,
    RenovarConvenioCrearBeneficiarioComponent,
    RenovarConvenioDesactivarBeneficiarioComponent
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
    RadioButtonModule,
    AccordionModule,
    UtileriaModule,
    ConfirmDialogModule,
    DialogModule,
  ],
  providers: [
    RenovarConvenioPfService
  ]

})



export class RenovarConvenioPfModule { }
