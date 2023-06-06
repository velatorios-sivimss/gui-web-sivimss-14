import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TituloPrincipalModule} from '../../shared/titulo-principal/titulo-principal.module';
import {OverlayPanelOpcionesModule} from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import {TablePanelModule} from '../../shared/table-panel/table-panel.module';

import {
  ProgramarMantenimientoVehicularComponent
} from './components/programar-mantenimiento-vehicular/programar-mantenimiento-vehicular.component';
import {MantenimientoVehicularRoutingModule} from './mantenimiento-vehicular.routing.module';
import {MantenimientoVehicularService} from './services/mantenimiento-vehicular.service';
import {
  NuevaVerificacionComponent
} from './components/nueva-verificacion/nueva-verificacion.component';
import {
  SolicitudMantenimientoComponent
} from './components/solicitud-mantenimiento/solicitud-mantenimiento/solicitud-mantenimiento.component';
import {
  DetalleSolicitudMantenimientoComponent
} from './components/solicitud-mantenimiento/detalle-solicitud-mantenimiento/detalle-solicitud-mantenimiento.component';
import {
  RegistroMantenimientoComponent
} from './components/registro-mantenimiento/registro-mantenimiento/registro-mantenimiento.component';
import {
  DetalleRegistroMantenimientoComponent
} from './components/registro-mantenimiento/detalle-registro-mantenimiento/detalle-registro-mantenimiento.component';
import {
  MantenimientoPredictivoComponent
} from './components/mantenimiento-predictivo/mantenimiento-predictivo.component';
import {ReporteEncargadoComponent} from './components/reporte-encargado/reporte-encargado.component';

import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {TableModule} from "primeng/table";
import {StepsModule} from "primeng/steps";
import {AccordionModule} from "primeng/accordion";
import {CheckboxModule} from "primeng/checkbox";
import {RadioButtonModule} from "primeng/radiobutton";
import {DetalleMantenimientoComponent} from "./components/detalle-mantenimiento/detalle-mantenimiento.component";
import {TabViewModule} from "primeng/tabview";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

@NgModule({
  declarations: [
    ProgramarMantenimientoVehicularComponent,
    NuevaVerificacionComponent,
    SolicitudMantenimientoComponent,
    DetalleSolicitudMantenimientoComponent,
    RegistroMantenimientoComponent,
    DetalleRegistroMantenimientoComponent,
    MantenimientoPredictivoComponent,
    ReporteEncargadoComponent,
    DetalleMantenimientoComponent
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    MantenimientoVehicularRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule,
    CheckboxModule,
    RadioButtonModule,
    UtileriaModule,
    TabViewModule,
    CeldaStickyModule,
    ValidaRolModule,
  ],
  providers: [MantenimientoVehicularService]
})
export class MantenimientoVehicularModule {
}
