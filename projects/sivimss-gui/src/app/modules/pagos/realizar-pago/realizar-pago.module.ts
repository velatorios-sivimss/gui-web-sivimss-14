import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealizarPagoRoutingModule } from './realizar-pago-routing.module';
import { RealizarPagoComponent } from './components/realizar-pago/realizar-pago.component';


@NgModule({
  declarations: [
    RealizarPagoComponent
  ],
  imports: [
    CommonModule,
    RealizarPagoRoutingModule
  ]
})
export class RealizarPagoModule { }
