import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContratarConvenioPrevisionFunerariaRoutingModule } from './contratar-convenio-prevision-funeraria-routing.module';
import { ContratarConvenioPrevisionFunerariaComponent } from './contratar-convenio-prevision-funeraria.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OverlayPanelOpcionesModule } from 'projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ModalRegistrarBeneficiarioComponent } from './components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalEditarBeneficiarioComponent } from './components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ModalDesactivarBeneficiarioComponent } from './components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import { DialogModule } from 'primeng/dialog';
import {UtileriaModule} from "../../../../../../shared/utileria/utileria.module";

@NgModule({
  declarations: [
    ContratarConvenioPrevisionFunerariaComponent,
    ModalRegistrarBeneficiarioComponent,
    ModalEditarBeneficiarioComponent,
    ModalDesactivarBeneficiarioComponent,
  ],
    imports: [
        CommonModule,
        ContratarConvenioPrevisionFunerariaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        DropdownModule,
        TituloPrincipalModule,
        BtnRegresarModule,
        TableModule,
        CheckboxModule,
        RadioButtonModule,
        OverlayPanelOpcionesModule,
        OverlayPanelModule,
        DialogModule,
        UtileriaModule
    ],
  providers: [DialogService],
})
export class ContratarConvenioPrevisionFunerariaModule {}
