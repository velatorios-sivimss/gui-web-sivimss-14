import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiConvenioPrevisionFunerariaRoutingModule } from './mi-convenio-prevision-funeraria-routing.module';
import { MiConvenioPrevisionFunerariaComponent } from './mi-convenio-prevision-funeraria.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { CeldaStickyModule } from 'projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { ModalDetalleBeneficiariosComponent } from './components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';
import { ModalEditarBeneficiarioComponent } from './components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ModalRegistrarNuevoBeneficiarioComponent } from './components/modal-registrar-nuevo-beneficiario/modal-registrar-nuevo-beneficiario.component';
import { ModalRenovarConvenioComponent } from './components/modal-renovar-convenio/modal-renovar-convenio.component';

@NgModule({
  declarations: [
    MiConvenioPrevisionFunerariaComponent,
    ModalDetalleBeneficiariosComponent,
    ModalRegistrarNuevoBeneficiarioComponent,
    ModalEditarBeneficiarioComponent,
    ModalRenovarConvenioComponent,
  ],
  imports: [
    CommonModule,
    MiConvenioPrevisionFunerariaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
    CeldaStickyModule,
    DynamicDialogModule,
    DropdownModule,
    CalendarModule,
  ],
  providers: [DialogService],
})
export class MiConvenioPrevisionFunerariaModule {}
