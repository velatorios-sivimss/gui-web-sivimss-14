import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {VelatoriosRoutingModule} from './velatorios-routing.module';
import {VelatoriosComponent} from './components/velatorios/velatorios.component';
import {AgregarVelatorioComponent} from './components/agregar-velatorio/agregar-velatorio.component';
import {DetalleVelatorioComponent} from './components/detalle-velatorio/detalle-velatorio.component';
import {ModificarVelatorioComponent} from './components/modificar-velatorio/modificar-velatorio.component';
import {
  CambioEstatusVelatorioComponent
} from './components/cambio-estatus-velatorio/cambio-estatus-velatorio.component';
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {VelatorioService} from "./services/velatorio.service";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";
import {UtileriaModule} from "../../shared/utileria/utileria.module";


@NgModule({
  declarations: [
    VelatoriosComponent,
    AgregarVelatorioComponent,
    DetalleVelatorioComponent,
    ModificarVelatorioComponent,
    CambioEstatusVelatorioComponent
  ],
  imports: [
    CommonModule,
    VelatoriosRoutingModule,
    TituloPrincipalModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TableModule,
    InputSwitchModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    ValidaRolModule,
    UtileriaModule
  ],
  providers: [VelatorioService]
})
export class VelatoriosModule {
}
