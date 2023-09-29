import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {InputSwitchModule} from 'primeng/inputswitch';
import {OverlayPanelModule} from 'primeng/overlaypanel';

import { TituloPrincipalModule } from '../../shared/titulo-principal/titulo-principal.module';
import { TablePanelModule } from '../../shared/table-panel/table-panel.module';
import { OverlayPanelOpcionesModule } from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import {DialogModule} from 'primeng/dialog';
import {StepsModule} from 'primeng/steps';
import {AutoCompleteModule} from 'primeng/autocomplete';

import {CalendarModule} from 'primeng/calendar';
import {AccordionModule} from 'primeng/accordion';
import { ComisionesComponent } from './components/comisiones/comisiones.component';
import { DetalleComisionComponent } from './components/detalle-comision/detalle-comision.component';
import { CalculoComisionesService } from './services/calculo-comisiones.service';
import { CalculoComisionesoRoutingModule } from './calculo-comisiones.routing.module';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { ValidaRolModule } from '../../shared/valida-rol/valida-rol.module';
import { ModalComisionComponent } from "./components/modal-comision/modal-comision.component";
import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";

@NgModule({
  declarations: [
    ComisionesComponent,
    DetalleComisionComponent,
    ModalComisionComponent
  ],
    imports: [
        CalendarModule,
        CommonModule,
        DialogModule,
        DropdownModule,
        DynamicDialogModule,
        FormsModule,
        InputSwitchModule,
        CalculoComisionesoRoutingModule,
        OverlayPanelModule,
        OverlayPanelOpcionesModule,
        ReactiveFormsModule,
        TableModule,
        TablePanelModule,
        TituloPrincipalModule,
        StepsModule,
        AccordionModule,
        AutoCompleteModule,
        ValidaRolModule,
        UtileriaModule,
        BtnRegresarModule,
    ],
  providers: [CalculoComisionesService]
})
export class CalculoComisionesModule {
}
