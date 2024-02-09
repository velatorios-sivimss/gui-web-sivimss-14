import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivadoRoutingModule } from './privado-routing.module';
import { PrivadoComponent } from './privado.component';
import { SubheaderPrivadoComponent } from './components/subheader-privado/subheader-privado.component';
import { ReciboPagoComponent } from './components/recibo-pago/recibo-pago.component';
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {CardModule} from "primeng/card";


@NgModule({
    declarations: [
        PrivadoComponent,
        SubheaderPrivadoComponent,
        ReciboPagoComponent
    ],
    exports: [
        ReciboPagoComponent
    ],
  imports: [
    CommonModule,
    PrivadoRoutingModule,
    TablePanelModule,
    CardModule
  ]
})
export class PrivadoModule { }
