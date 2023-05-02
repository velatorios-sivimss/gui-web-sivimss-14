import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';


import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { OverlayPanelOpcionesModule } from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from '../../shared/table-panel/table-panel.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { AdministrarArticulosComponent } from './components/administrar-articulos/administrar-articulos.component';
import { ArticulosService } from './services/articulos.service';
import { ArticulosRoutingModule } from './articulos.routing.module';
import { AgregarArticulosComponent } from './components/agregar-articulos/agregar-articulos.component';
import { DetalleArticulosComponent } from './components/detalle-articulos/detalle-articulos.component';
import { ModificarArticulosComponent } from './components/modificar-articulos/modificar-articulos.component';
import { UtileriaModule } from '../../shared/utileria/utileria.module';

@NgModule({
  declarations: [
    AdministrarArticulosComponent,
    AgregarArticulosComponent,
    DetalleArticulosComponent,
    ModificarArticulosComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    ArticulosRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule,
    AutoCompleteModule,
    UtileriaModule,
  ],
  providers: [ArticulosService]
})
export class ArticulosModule { }
