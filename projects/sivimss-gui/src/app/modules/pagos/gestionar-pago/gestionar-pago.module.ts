import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GestionarPagoRoutingModule} from './gestionar-pago-routing.module';
import {GestionarPagoComponent} from './components/gestionar-pago/gestionar-pago.component';
import {GestionarPagoService} from "./services/gestionar-pago.service";
import {TituloPrincipalModule} from "../../../shared/titulo-principal/titulo-principal.module";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {CeldaStickyModule} from "../../../shared/celda-sticky/celda-sticky.module";
import {TableModule} from "primeng/table";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../../shared/overlay-panel-opciones/overlay-panel-opciones.module";


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
    CeldaStickyModule,
    TableModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
  ],
  providers: [GestionarPagoService]
})
export class GestionarPagoModule {
}
