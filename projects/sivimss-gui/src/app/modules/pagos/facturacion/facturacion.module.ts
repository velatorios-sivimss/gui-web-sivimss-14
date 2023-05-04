import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { FacturacionComponent } from './components/facturacion/facturacion.component';
import { SolicitarFacturaComponent } from './components/solicitar-factura/solicitar-factura.component';


@NgModule({
  declarations: [
    FacturacionComponent,
    SolicitarFacturaComponent
  ],
  imports: [
    CommonModule,
    FacturacionRoutingModule
  ]
})
export class FacturacionModule { }
