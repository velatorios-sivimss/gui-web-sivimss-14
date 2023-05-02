import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { UtileriaModule } from '../../../shared/utileria/utileria.module';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { CuotasRoutingModule } from './cuotas-routing.module';
import { CuotasComponent } from './components/cuotas/cuotas.component';
import { AgregarCuotasComponent } from './components/agregar-cuotas/agregar-cuotas.component';
import { VerDetalleCuotasComponent } from './components/ver-detalle-cuotas/ver-detalle-cuotas.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../../shared/titulo-principal/titulo-principal.module";
import { CuotasService } from "./services/cuotas.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { CheckboxModule } from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';

@NgModule({
  declarations: [
    CuotasComponent,
    AgregarCuotasComponent,
    VerDetalleCuotasComponent,
  ],
  imports: [
    CommonModule,
    CuotasRoutingModule,
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
    CuotasService
  ]
})
export class CuotasModule {
}
