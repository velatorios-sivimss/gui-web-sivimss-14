import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CeldaStickyModule} from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";
import {ValidaRolModule} from "projects/sivimss-gui/src/app/shared/valida-rol/valida-rol.module";

import {UsuariosRoutingModule} from './usuarios-routing.module';
import {UsuariosComponent} from './components/usuarios/usuarios.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {UsuarioService} from "./services/usuario.service";
import {DropdownModule} from "primeng/dropdown";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {DialogModule} from "primeng/dialog";
import {CalendarModule} from "primeng/calendar";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {AgregarUsuarioComponent} from './components/agregar-usuario/agregar-usuario.component';
import {ModificarUsuarioComponent} from './components/modificar-usuario/modificar-usuario.component';
import {VerDetalleUsuarioComponent} from './components/ver-detalle-usuario/ver-detalle-usuario.component';
import {CambioEstatusUsuarioComponent} from './components/cambio-estatus-usuario/cambio-estatus-usuario.component';
import {UtileriaModule} from "../../shared/utileria/utileria.module";


@NgModule({
  declarations: [
    UsuariosComponent,
    AgregarUsuarioComponent,
    ModificarUsuarioComponent,
    VerDetalleUsuarioComponent,
    CambioEstatusUsuarioComponent
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    CalendarModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    ValidaRolModule,
    UtileriaModule
  ],
  providers: [UsuarioService]
})
export class UsuariosModule {
}
