import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";

import { CapillasRoutingModule } from './capillas-routing.module';
import { CapillasComponent } from './components/capillas/capillas.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { CapillaService } from "./services/capilla.service";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { DetalleCapillaComponent } from './components/detalle-capilla/detalle-capilla.component';
import { AgregarCapillaComponent } from './components/agregar-capilla/agregar-capilla.component';
import { ModificarCapillaComponent } from './components/modificar-capilla/modificar-capilla.component';


@NgModule({
  declarations: [
    CapillasComponent,
    DetalleCapillaComponent,
    AgregarCapillaComponent,
    ModificarCapillaComponent,
  ],
  imports: [
    CommonModule,
    CapillasRoutingModule,
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
    AccordionModule,
    AutoCompleteModule,
    UtileriaModule,
  ],
  providers: [
    CapillaService
  ]
})
export class CapillasModule {
}
