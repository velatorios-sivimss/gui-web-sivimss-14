import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './components/roles/roles.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { RolService } from "./services/rol.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { AgregarRolComponent } from './components/agregar-rol/agregar-rol.component';
import { OverlayPanelModule } from "primeng/overlaypanel";
import { OverlayPanelOpcionesModule } from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "../../shared/table-panel/table-panel.module";
import { PermisosPipe } from './pipes/permisos.pipe';
import { VerDetalleRolComponent } from './components/ver-detalle-rol/ver-detalle-rol.component';
import { ModificarRolComponent } from './components/modificar-rol/modificar-rol.component';


@NgModule({
  declarations: [
    RolesComponent,
    AgregarRolComponent,
    PermisosPipe,
    VerDetalleRolComponent,
    ModificarRolComponent
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
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
    CeldaStickyModule
  ],
  providers: [
    RolService
  ]
})
export class RolesModule {
}
