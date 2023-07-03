import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionarPagoRoutingModule } from './gestionar-pago-routing.module';
import { GestionarPagoComponent } from './components/gestionar-pago/gestionar-pago.component';


@NgModule({
  declarations: [
    GestionarPagoComponent
  ],
  imports: [
    CommonModule,
    GestionarPagoRoutingModule
  ]
})
export class GestionarPagoModule { }
