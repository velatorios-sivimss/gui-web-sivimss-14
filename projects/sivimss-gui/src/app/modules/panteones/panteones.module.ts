import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { PanteonesRoutingModule } from './panteones-routing.module';
import { PanteonesComponent } from './components/panteones/panteones.component';
import { AgregarPanteonesComponent } from './components/agregar-panteones/agregar-panteones.component';
import { VerDetallePanteonesComponent } from './components/ver-detalle-panteones/ver-detalle-panteones.component';
import { ModificarPanteonesComponent } from './components/modificar-panteones/modificar-panteones.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { PanteonesService } from "./services/panteones.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { CheckboxModule } from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';

@NgModule({
  declarations: [
    PanteonesComponent,
    AgregarPanteonesComponent,
    VerDetallePanteonesComponent,
    ModificarPanteonesComponent,
  ],
  imports: [
    CommonModule,
    PanteonesRoutingModule,
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
  ],
  providers: [
    PanteonesService
  ]
})
export class PanteonesModule {
}
