import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";

import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {InputNumberModule} from "primeng/inputnumber";
import {InputSwitchModule} from "primeng/inputswitch";
import {MultiSelectModule} from "primeng/multiselect";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {RadioButtonModule} from "primeng/radiobutton";
import {StepsModule} from "primeng/steps";
import {TableModule} from "primeng/table";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import {ServiciosFunerariosComponent} from "./components/servicios-funerarios/servicios-funerarios.component";
import {ServiciosFunerariosConsultaService} from "./services/servicios-funerarios-consulta.service";
import {ServiciosFunerariosRoutingModule} from "./servicios-funerarios-routing.module";
import {ServiciosFunerariosService} from "./services/servicios-funerarios.service";
import { DetalleServiciosFunerariosComponent } from './components/detalle-servicios-funerarios/detalle-servicios-funerarios.component';
import { AltaServiciosFunerariosComponent } from './components/alta-servicios-funerarios/alta-servicios-funerarios.component';
import {AccordionModule} from "primeng/accordion";
import { CancelarServiciosFunerariosComponent } from './components/cancelar-servicios-funerarios/cancelar-servicios-funerarios.component';
import { ModificarServiciosFunerariosComponent } from './components/modificar-servicios-funerarios/modificar-servicios-funerarios.component';
import { ModalRealizarPagoComponent } from './components/modal-realizar-pago/modal-realizar-pago.component';
import { ModalEliminarPagoComponent } from './components/modal-eliminar-pago/modal-eliminar-pago.component';
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";
import {DetallePagoService} from "./services/detalle-pago.service";
import { ModalModificarPagosComponent } from './components/modal-modificar-pagos/modal-modificar-pagos.component';
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

@NgModule({
  declarations:[
    ServiciosFunerariosComponent,
    DetalleServiciosFunerariosComponent,
    AltaServiciosFunerariosComponent,
    CancelarServiciosFunerariosComponent,
    ModificarServiciosFunerariosComponent,
    ModalRealizarPagoComponent,
    ModalEliminarPagoComponent,
    ModalModificarPagosComponent
  ],
  imports: [
    CommonModule,
    ServiciosFunerariosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    TableModule,
    InputNumberModule,
    InputSwitchModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    CalendarModule,
    MultiSelectModule,
    StepsModule,
    RadioButtonModule,
    AccordionModule,
    UtileriaModule,
    BtnRegresarModule,
    ValidaRolModule
  ],
  providers:[
    ServiciosFunerariosService,
    ServiciosFunerariosConsultaService,
    DetallePagoService
  ]
})

export class ServiciosFunerariosModule {

}
