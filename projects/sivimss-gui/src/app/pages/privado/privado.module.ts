import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivadoRoutingModule } from './privado-routing.module';
import { PrivadoComponent } from './privado.component';
import { SubheaderPrivadoComponent } from './components/subheader-privado/subheader-privado.component';
import { ReciboPagoComponent } from './components/recibo-pago/recibo-pago.component';
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";


@NgModule({
  declarations: [
    PrivadoComponent,
    SubheaderPrivadoComponent,
    ReciboPagoComponent
  ],
    imports: [
        CommonModule,
        PrivadoRoutingModule,
        TablePanelModule
    ]
})
export class PrivadoModule { }
