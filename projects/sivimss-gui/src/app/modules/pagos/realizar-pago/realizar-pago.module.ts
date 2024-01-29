import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealizarPagoRoutingModule } from './realizar-pago-routing.module';
import { RealizarPagoComponent } from './components/realizar-pago/realizar-pago.component';
import { TituloPrincipalModule } from "../../../shared/titulo-principal/titulo-principal.module";
import { ReactiveFormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { UtileriaModule } from "../../../shared/utileria/utileria.module";
import { ValidaRolModule } from "../../../shared/valida-rol/valida-rol.module";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { OverlayPanelOpcionesModule } from "../../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { DialogModule } from "primeng/dialog";
import { PagoOrdenServicioComponent } from './components/listados-pago-por-tipos/pago-orden-servicio/pago-orden-servicio.component';
import { PagoConvenioComponent } from './components/listados-pago-por-tipos/pago-convenio/pago-convenio.component';
import {
  PagoRenovacionConvenioComponent
} from './components/listados-pago-por-tipos/pago-renovacion-convenio/pago-renovacion-convenio.component';
import { RegistrarTipoPagoComponent } from './components/registrar-pago/registrar-tipo-pago/registrar-tipo-pago.component';
import { RegistrarAgfComponent } from './components/registrar-pago/registrar-agf/registrar-agf.component';
import {
  RegistrarValeParitariaComponent
} from './components/registrar-pago/registrar-vale-paritaria/registrar-vale-paritaria.component';
import { TablePanelModule } from "../../../shared/table-panel/table-panel.module";
import { CheckboxModule } from "primeng/checkbox";
import {
  SeleccionBeneficiariosAgfComponent
} from './components/registrar-pago/seleccion-beneficiarios-agf/seleccion-beneficiarios-agf.component';
import { DetalleMetodoPagoComponent } from './components/detalle-metodo-pago/detalle-metodo-pago.component';
import { CeldaStickyModule } from "../../../shared/celda-sticky/celda-sticky.module";
import { RealizarPagoService } from "./services/realizar-pago.service";
import { AccordionModule } from "primeng/accordion";
import { ModificarMetodoPagoComponent } from './components/modificar-metodo-pago/modificar-metodo-pago.component';
import { InputNumberModule } from "primeng/inputnumber";
import { ModificarTipoPagoComponent } from './components/modificar-tipo-pago/modificar-tipo-pago.component';
import { EliminarTipoPagoComponent } from './components/eliminar-tipo-pago/eliminar-tipo-pago.component';
import { BtnRegresarModule } from "../../../shared/btn-regresar/btn-regresar.module";
import { ControlPagoComponent } from './components/control-pago/control-pago.component';
import {TooltipModule} from "primeng/tooltip";


@NgModule({
  declarations: [
    RealizarPagoComponent,
    PagoOrdenServicioComponent,
    PagoConvenioComponent,
    PagoRenovacionConvenioComponent,
    RegistrarTipoPagoComponent,
    RegistrarAgfComponent,
    RegistrarValeParitariaComponent,
    SeleccionBeneficiariosAgfComponent,
    DetalleMetodoPagoComponent,
    ModificarMetodoPagoComponent,
    ModificarTipoPagoComponent,
    EliminarTipoPagoComponent,
    ControlPagoComponent,
  ],
  imports: [
    CommonModule,
    RealizarPagoRoutingModule,
    TituloPrincipalModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    UtileriaModule,
    ValidaRolModule,
    TableModule,
    InputSwitchModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    DialogModule,
    TablePanelModule,
    CheckboxModule,
    CeldaStickyModule,
    AccordionModule,
    InputNumberModule,
    BtnRegresarModule,
    TooltipModule
  ],
  providers: [RealizarPagoService]
})
export class RealizarPagoModule {
}
