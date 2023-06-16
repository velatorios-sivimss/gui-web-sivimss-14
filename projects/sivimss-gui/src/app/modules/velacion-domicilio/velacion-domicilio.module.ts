import {NgModule} from "@angular/core";
import {VelacionDomicilioService} from "./services/velacion-domicilio.service";
import {VelacionDomicilioComponent} from "./components/velacion-domicilio/velacion-domicilio.component";
import {VelacionDomicilioRoutingModule} from "./velacion-domicilio-routing.module";
import {CommonModule} from "@angular/common";
import {ServiciosRoutingModule} from "../servicios/servicios-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {DialogModule} from "primeng/dialog";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";
import {CalendarModule} from "primeng/calendar";
import {AccordionModule} from "primeng/accordion";
import { RegistrarEntradaEquipoComponent } from './components/registrar-entrada-equipo/registrar-entrada-equipo.component';
import { DetalleVelacionDomicilioComponent } from './components/detalle-velacion-domicilio/detalle-velacion-domicilio.component';
import { GenerarValeSalidaComponent } from './components/generar-vale-salida/generar-vale-salida.component';
import { UtileriaModule } from "../../shared/utileria/utileria.module";
import { EliminarArticuloComponent } from "./components/eliminar-articulo/eliminar-articulo.component";
import { ValidaRolModule } from "../../shared/valida-rol/valida-rol.module";


@NgModule({
  declarations:[
    VelacionDomicilioComponent,
    RegistrarEntradaEquipoComponent,
    DetalleVelacionDomicilioComponent,
    GenerarValeSalidaComponent,
    EliminarArticuloComponent
  ],
  imports: [
    VelacionDomicilioRoutingModule,
    CommonModule,
    ServiciosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    CalendarModule,
    AccordionModule,
    ValidaRolModule,
    UtileriaModule,
  ],
  providers:[
    VelacionDomicilioService,
  ]
})

export class VelacionDomicilioModule{

}
