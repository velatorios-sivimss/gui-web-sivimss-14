import { AdministrarProveedoresComponent } from './components/administrar-proveedores/administrar-proveedores.component';
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
import { ProveedoresService } from './services/proveedores.service';
import { ProveedoresRoutingModule } from './proveedores.routing.module';
import { DetalleProveedorComponent } from './components/detalle-proveedor/detalle-proveedor.component';
import { AgregarProveedorComponent } from './components/agregar-proveedor/agregar-proveedor.component';
import { VerDetalleProveedorComponent } from './components/ver-detalle-proveedor/ver-detalle-proveedor.component';
import { ModificarProveedorComponent } from './components/modificar-proveedor/modificar-proveedor.component';
import { AccordionModule } from 'primeng/accordion';

//as
@NgModule({
  declarations: [
    AdministrarProveedoresComponent,
    DetalleProveedorComponent,
    AgregarProveedorComponent,
    VerDetalleProveedorComponent,
    ModificarProveedorComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    ProveedoresRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule
  ],
  providers: [ProveedoresService]
})
export class ProveedoresModule { }
