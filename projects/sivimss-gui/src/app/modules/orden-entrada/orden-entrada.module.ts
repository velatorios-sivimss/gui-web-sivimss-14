import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";

import {AutoCompleteModule} from "primeng/autocomplete";
import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {SelectButtonModule} from "primeng/selectbutton";
import {TableModule} from "primeng/table";
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";
import {TabViewModule} from "primeng/tabview";

import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";
import {OverlayPanelOpcionesModule} from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import {ValidaRolModule} from "../../shared/valida-rol/valida-rol.module";

import {OrdenEntradaRoutingModule} from "./orden-entrada-routing.module";
import {OrdenEntradaComponent} from "./components/orden-entrada/orden-entrada.component";
import {OrdenEntradaService} from "./services/orden-entrada.service";
import { ConsultaOrdenEntradaComponent } from './components/consulta-orden-entrada/consulta-orden-entrada.component';
import { ConsultaStockComponent } from './components/consulta-stock/consulta-stock.component';

@NgModule({
  declarations: [
    OrdenEntradaComponent,
    ConsultaOrdenEntradaComponent,
    ConsultaStockComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    AutoCompleteModule,
    CalendarModule,
    DialogModule,
    DropdownModule,
    OverlayPanelModule,
    SelectButtonModule,
    TableModule,
    TablePanelModule,


    TabViewModule,
    BtnRegresarModule,
    OverlayPanelOpcionesModule,
    TituloPrincipalModule,
    UtileriaModule,

    ValidaRolModule,
    OrdenEntradaRoutingModule,
  ],
  providers: [
    OrdenEntradaService
  ]
})
export class OrdenEntradaModule{}
