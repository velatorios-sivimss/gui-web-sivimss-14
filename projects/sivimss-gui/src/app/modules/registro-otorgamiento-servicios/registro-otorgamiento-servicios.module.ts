import {NgModule} from "@angular/core";
import {
  RegistroOtorgamientoServiciosComponent
} from "./components/registro-otorgamiento-servicios/registro-otorgamiento-servicios.component";
import {
  DetalleRegistroOtorgamientoServiciosComponent
} from "./components/detalle-registro-otorgamiento-servicios/detalle-registro-otorgamiento-servicios.component";
import {
  AgregarRegistroOtorgamientoServiciosComponent
} from "./components/agregar-registro-otorgamiento-servicios/agregar-registro-otorgamiento-servicios.component";
import {CommonModule} from "@angular/common";
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
import {RegistroOtorgamientoServiciosRoutingModule} from "./registro-otorgamiento-servicios.routing";
import {RegistroOtorgamientoServiciosService} from "./services/registro-otorgamiento-servicios.service";
import { CheckboxModule } from "primeng/checkbox";


@NgModule({
  declarations: [
    RegistroOtorgamientoServiciosComponent,
    AgregarRegistroOtorgamientoServiciosComponent,
    DetalleRegistroOtorgamientoServiciosComponent,
  ],
  imports: [
    CommonModule,
    RegistroOtorgamientoServiciosRoutingModule,
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
    CheckboxModule
  ],
  providers:[
    RegistroOtorgamientoServiciosService
  ]
})

export class RegistroOtorgamientoServiciosModule{

}
