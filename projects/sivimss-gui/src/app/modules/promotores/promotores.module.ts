import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { PromotoresRoutingModule } from './promotores-routing.module';
import { PromotoresComponent } from './components/promotores/promotores.component';
import { AgregarPromotoresComponent } from './components/agregar-promotores/agregar-promotores.component';
import { VerDetallePromotoresComponent } from './components/ver-detalle-promotores/ver-detalle-promotores.component';
import { ModificarPromotoresComponent } from './components/modificar-promotores/modificar-promotores.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { PromotoresService } from "./services/promotores.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { CheckboxModule } from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';
import { UsuarioService } from '../usuarios/services/usuario.service';
import { ValidaRolModule } from '../../shared/valida-rol/valida-rol.module';

@NgModule({
  declarations: [
    PromotoresComponent,
    AgregarPromotoresComponent,
    VerDetallePromotoresComponent,
    ModificarPromotoresComponent,
  ],
  imports: [
    CommonModule,
    PromotoresRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CheckboxModule,
    UtileriaModule,
    AutoCompleteModule,
    CalendarModule,
    ValidaRolModule,
  ],
  providers: [
    PromotoresService,
    UsuarioService
  ]
})
export class PromotoresModule {
}
