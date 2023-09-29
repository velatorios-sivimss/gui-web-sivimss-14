import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";
import { RolesRoutingModule } from './vales-paritaria-routing.module';
import { ValesParitariaComponent } from './components/vales-paritaria/vales-paritaria.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { SolicitarValeParitariaComponent } from './components/solicitar-vale-paritaria/solicitar-vale-paritaria.component';
import { OverlayPanelOpcionesModule } from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "../../shared/table-panel/table-panel.module";
import { ModificarCreditoComponent } from './components/modificar-credito/modificar-credito.component';
import {DropdownModule} from "primeng/dropdown";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import {DialogModule} from "primeng/dialog";
import {CheckboxModule} from "primeng/checkbox";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {AccordionModule} from "primeng/accordion";
import {CalendarModule} from "primeng/calendar";

@NgModule({
  declarations: [
    ValesParitariaComponent,
    SolicitarValeParitariaComponent,
    ModificarCreditoComponent
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
    CeldaStickyModule,
    AccordionModule,
    CalendarModule
  ]
})
export class ValesParitariaModule {
}
