import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { BtnRegresarModule } from "projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module";
import { CustomTemplateModule } from "projects/sivimss-gui/src/app/shared/custom-template/custom-template.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { TituloPrincipalModule } from "projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module";

import { RealizarBalanceCajaRoutingModule } from './realizar-balance-caja-routing.module';
import { RealizarBalanceCajaComponent } from './realizar-balance-caja.component';


@NgModule({
  declarations: [
    RealizarBalanceCajaComponent
  ],
  imports: [
    CommonModule,
    RealizarBalanceCajaRoutingModule,
    BtnRegresarModule,
    CustomTemplateModule,
    ReactiveFormsModule,
    TablePanelModule,
    TituloPrincipalModule
  ]
})
export class RealizarBalanceCajaModule { }
