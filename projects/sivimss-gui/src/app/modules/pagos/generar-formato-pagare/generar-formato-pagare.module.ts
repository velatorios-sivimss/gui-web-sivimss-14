import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { TituloPrincipalModule } from '../../../shared/titulo-principal/titulo-principal.module';
import { TablePanelModule } from '../../../shared/table-panel/table-panel.module';
import { OverlayPanelOpcionesModule } from '../../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { GenerarFormatoPagareComponent } from './components/generar-formato-pagare/generar-formato-pagare.component';
import { GenerarFormatoPagareService } from './services/generar-formato-pagare.service';
import { GenerarReciboRoutingModule } from './generar-formato-pagare.routing.module';
import { ReciboFormatoPagareComponent } from './components/recibo-formato-pagare/recibo-formato-pagare.component';
import { UtileriaModule } from '../../../shared/utileria/utileria.module';
import {BtnRegresarModule} from "../../../shared/btn-regresar/btn-regresar.module";

@NgModule({
  declarations: [
    GenerarFormatoPagareComponent,
    ReciboFormatoPagareComponent
  ],
    imports: [
        CalendarModule,
        CommonModule,
        DialogModule,
        DropdownModule,
        DynamicDialogModule,
        FormsModule,
        InputSwitchModule,
        GenerarReciboRoutingModule,
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
        BtnRegresarModule,
    ],
  providers: [GenerarFormatoPagareService]
})
export class GenerarFormatoPagareModule { }
