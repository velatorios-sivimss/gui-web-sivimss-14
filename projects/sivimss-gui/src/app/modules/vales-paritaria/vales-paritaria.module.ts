import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeldaStickyModule } from "projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module";
import { AccordionModule } from 'primeng-lts/accordion';
import { RolesRoutingModule } from './vales-paritaria-routing.module';
import { ValesParitariaComponent } from './components/vales-paritaria/vales-paritaria.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { DropdownModule } from "primeng-lts/dropdown";
import { TableModule } from "primeng-lts/table";
import { CalendarModule } from 'primeng-lts/calendar';
import { InputSwitchModule } from "primeng-lts/inputswitch";
import { DialogModule } from "primeng-lts/dialog";
import { CheckboxModule } from "primeng-lts/checkbox";
import { SolicitarValeParitariaComponent } from './components/solicitar-vale-paritaria/solicitar-vale-paritaria.component';
import { OverlayPanelModule } from "primeng-lts/overlaypanel";
import { OverlayPanelOpcionesModule } from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TablePanelModule } from "../../shared/table-panel/table-panel.module";
import { ModificarCreditoComponent } from './components/modificar-credito/modificar-credito.component';

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
