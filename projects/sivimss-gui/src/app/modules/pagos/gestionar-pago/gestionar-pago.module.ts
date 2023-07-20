import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GestionarPagoRoutingModule} from './gestionar-pago-routing.module';
import {GestionarPagoComponent} from './components/gestionar-pago/gestionar-pago.component';
import {GestionarPagoService} from "./services/gestionar-pago.service";
import {TituloPrincipalModule} from "../../../shared/titulo-principal/titulo-principal.module";
import {PaginatorModule} from "primeng/paginator";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CeldaStickyModule} from "../../../shared/celda-sticky/celda-sticky.module";
import {TableModule} from "primeng/table";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {CalendarModule} from "primeng/calendar";
import {DetalleGestionPagoComponent} from './components/detalle-gestion-pago/detalle-gestion-pago.component';
import {CustomTemplateModule} from "../../../shared/custom-template/custom-template.module";
import {TablePanelModule} from "../../../shared/table-panel/table-panel.module";
import {AccordionModule} from "primeng/accordion";
import {ModificarMetodoPagoComponent} from './components/modificar-metodo-pago/modificar-metodo-pago.component';
import {CancelarMetodoPagoComponent} from './components/cancelar-metodo-pago/cancelar-metodo-pago.component';
import {InputTextareaModule} from "primeng/inputtextarea";
import { IrAPagoComponent } from './components/ir-a-pago/ir-a-pago.component';


@NgModule({
  declarations: [
    GestionarPagoComponent,
    DetalleGestionPagoComponent,
    ModificarMetodoPagoComponent,
    CancelarMetodoPagoComponent,
    IrAPagoComponent
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
    CalendarModule,
    CustomTemplateModule,
    TablePanelModule,
    AccordionModule,
    InputTextareaModule,
    FormsModule
  ],
  providers: [GestionarPagoService]
})
export class GestionarPagoModule {
}
