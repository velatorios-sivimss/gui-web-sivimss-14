import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";
import { ValidaRolModule } from "projects/sivimss-gui/src/app/shared/valida-rol/valida-rol.module";

import { RolPermisosRoutingModule } from './rol-permisos-routing.module';
import { RolesPermisosComponent } from './components/roles-permisos/roles-permisos.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { RolPermisosService } from "./services/rol-permisos.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { AgregarRolPermisosComponent } from './components/agregar-rol-permisos/agregar-rol-permisos.component';
import { OverlayPanelModule } from "primeng/overlaypanel";
import { OverlayPanelOpcionesModule } from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "../../shared/table-panel/table-panel.module";
import { PermisosPipe } from './pipes/permisos.pipe';
import { VerDetalleRolPermisosComponent } from './components/ver-detalle-rol-permisos/ver-detalle-rol-permisos.component';
import { ModificarRolPermisosComponent } from './components/modificar-rol-permisos/modificar-rol-permisos.component';

@NgModule({
  declarations: [
    RolesPermisosComponent,
    AgregarRolPermisosComponent,
    PermisosPipe,
    VerDetalleRolPermisosComponent,
    ModificarRolPermisosComponent
  ],
  imports: [
    CommonModule,
    RolPermisosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    CheckboxModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    ValidaRolModule
  ],
  providers: [
    RolPermisosService
  ]
})
export class RolesPermisosModule {
}
