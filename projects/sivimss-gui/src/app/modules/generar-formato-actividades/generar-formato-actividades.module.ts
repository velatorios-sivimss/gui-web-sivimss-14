import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PromotoresRoutingModule } from './generar-formato-actividades-routing.module';
import { GenerarFormatoActividadesComponent } from './components/generar-formato-actividades/generar-formato-actividades.component';
import { AgregarGenerarFormatoActividadesComponent } from './components/agregar-generar-formato-actividades/agregar-generar-formato-actividades.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { GenerarFormatoActividadesService } from "./services/generar-formato-actividades.service";
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
    GenerarFormatoActividadesComponent,
    AgregarGenerarFormatoActividadesComponent,
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
    GenerarFormatoActividadesService,
    UsuarioService
  ]
})
export class GenerarFormatoActividadesModule {
}
