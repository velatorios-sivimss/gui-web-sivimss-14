import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PromotoresRoutingModule } from './generar-hoja-consignacion-routing.module';
import { GenerarHojaConsignacionComponent } from './components/generar-hoja-consignacion/generar-hoja-consignacion.component';
import { AgregarGenerarHojaConsignacionComponent } from './components/agregar-generar-hoja-consignacion/agregar-generar-hoja-consignacion.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { GenerarHojaConsignacionService } from "./services/generar-hoja-consignacion.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { UsuarioService } from '../usuarios/services/usuario.service';
import { ValidaRolModule } from '../../shared/valida-rol/valida-rol.module';

@NgModule({
  declarations: [
    GenerarHojaConsignacionComponent,
    AgregarGenerarHojaConsignacionComponent,
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
    GenerarHojaConsignacionService,
    UsuarioService
  ]
})
export class GenerarHojaConsignacionModule {
}