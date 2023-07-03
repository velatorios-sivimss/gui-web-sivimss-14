import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GestionarPagoRoutingModule} from './gestionar-pago-routing.module';
import {GestionarPagoComponent} from './components/gestionar-pago/gestionar-pago.component';
import {GestionarPagoService} from "./services/gestionar-pago.service";
import {TituloPrincipalModule} from "../../../shared/titulo-principal/titulo-principal.module";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    GestionarPagoComponent
  ],
  imports: [
    CommonModule,
    GestionarPagoRoutingModule,
    TituloPrincipalModule,
    PaginatorModule,
    ReactiveFormsModule,
  ],
  providers: [GestionarPagoService]
})
export class GestionarPagoModule {
}
