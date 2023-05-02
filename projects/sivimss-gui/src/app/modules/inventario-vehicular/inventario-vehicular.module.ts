import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { InventarioVehicularRoutingModule } from './inventario-vehicular-routing.module';
import { InventarioVehicularService } from './services/inventario-vehicular.service';
import { InventarioVehicularComponent } from './components/inventario-vehicular/inventario-vehicular.component';
import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { OverlayPanelOpcionesModule } from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from '../../shared/table-panel/table-panel.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { AgregarVehiculoComponent } from './components/agregar-vehiculo/agregar-vehiculo.component';
import { ModificarVehiculoComponent } from './components/modificar-vehiculo/modificar-vehiculo.component';
import { VerDetalleVehiculoComponent } from './components/ver-detalle-vehiculo/ver-detalle-vehiculo.component';
import { CalendarModule } from 'primeng/calendar';
import { DetalleVehiculoComponent } from './components/detalle-vehiculo/detalle-vehiculo.component';

@NgModule({
  declarations: [
    InventarioVehicularComponent,
    AgregarVehiculoComponent,
    ModificarVehiculoComponent,
    VerDetalleVehiculoComponent,
    DetalleVehiculoComponent
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    InventarioVehicularRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
  ],
  providers: [InventarioVehicularService]
})
export class InventarioVehicularModule { }
