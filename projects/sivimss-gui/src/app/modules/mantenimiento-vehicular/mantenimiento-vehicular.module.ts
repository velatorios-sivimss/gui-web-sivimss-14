import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';


import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { OverlayPanelOpcionesModule } from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from '../../shared/table-panel/table-panel.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { ProgramarMantenimientoVehicularComponent } from './components/programar-mantenimiento-vehicular/programar-mantenimiento-vehicular.component';
import { MantenimientoVehicularRoutingModule } from './mantenimiento-vehicular.routing.module';
import { MantenimientoVehicularService } from './services/mantenimiento-vehicular.service';
import { NuevaVerificacionComponent } from './components/nueva-verificacion/nueva-verificacion/nueva-verificacion.component';
import { DetalleNuevaVerificacionComponent } from './components/nueva-verificacion/detalle-nueva-verificacion/detalle-nueva-verificacion.component';
import { SolicitudMantenimientoComponent } from './components/solicitud-mantenimiento/solicitud-mantenimiento/solicitud-mantenimiento.component';
import { DetalleSolicitudMantenimientoComponent } from './components/solicitud-mantenimiento/detalle-solicitud-mantenimiento/detalle-solicitud-mantenimiento.component';
import { RegistroMantenimientoComponent } from './components/registro-mantenimiento/registro-mantenimiento/registro-mantenimiento.component';
import { DetalleRegistroMantenimientoComponent } from './components/registro-mantenimiento/detalle-registro-mantenimiento/detalle-registro-mantenimiento.component';
import { MantenimientoPredictivoComponent } from './components/mantenimiento-predictivo/mantenimiento-predictivo.component';
import { ReporteEncargadoComponent } from './components/reporte-encargado/reporte-encargado.component';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';

//as
@NgModule({
  declarations: [
    ProgramarMantenimientoVehicularComponent,
    NuevaVerificacionComponent,
    DetalleNuevaVerificacionComponent,
    SolicitudMantenimientoComponent,
    DetalleSolicitudMantenimientoComponent,
    RegistroMantenimientoComponent,
    DetalleRegistroMantenimientoComponent,
    MantenimientoPredictivoComponent,
    ReporteEncargadoComponent,
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
  ],
  providers: [MantenimientoVehicularService]
})
export class MantenimientoVehicularModule { }
