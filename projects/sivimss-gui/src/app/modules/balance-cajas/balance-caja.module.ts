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
import { BalanceCajaComponent } from './components/balance-caja/balance-caja.component';
import { BalanceCajaService } from './services/balance-caja.service';
import { CalculoComisionesoRoutingModule } from './balance-caja.routing.module';
import { ValidaRolModule } from '../../shared/valida-rol/valida-rol.module';
import { ModificarPagoComponent } from './components/modificar-pago/modificar-pago.component';
import { RealizarCierreComponent } from './components/realizar-cierre/realizar-cierre.component';
import {BtnRegresarModule} from "../../shared/btn-regresar/btn-regresar.module";
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";

@NgModule({
  declarations: [
    BalanceCajaComponent,
    ModificarPagoComponent,
    RealizarCierreComponent
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
        BtnRegresarModule,
        CeldaStickyModule
    ],
  providers: [BalanceCajaService]
})
export class BalanceCajaModule {
}
