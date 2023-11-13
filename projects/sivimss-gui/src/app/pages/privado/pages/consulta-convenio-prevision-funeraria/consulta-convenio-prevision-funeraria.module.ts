import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsultaConvenioPrevisionFunerariaRoutingModule } from './consulta-convenio-prevision-funeraria-routing.module';
import { ConsultaConvenioPrevisionFunerariaComponent } from './consulta-convenio-prevision-funeraria.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { TableModule } from 'primeng/table';
import { CeldaStickyModule } from 'projects/sivimss-gui/src/app/shared/celda-sticky/celda-sticky.module';
import { ModalDetalleBeneficiariosComponent } from './pages/mi-convenio-prevision-funeraria/components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ModalRegistrarNuevoBeneficiarioComponent } from './pages/mi-convenio-prevision-funeraria/components/modal-registrar-nuevo-beneficiario/modal-registrar-nuevo-beneficiario.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ModalEditarBeneficiarioComponent } from './pages/mi-convenio-prevision-funeraria/components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [ConsultaConvenioPrevisionFunerariaComponent],
  imports: [
    CommonModule,
    ConsultaConvenioPrevisionFunerariaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
    CeldaStickyModule,
    DialogModule,
  ],
  providers: [DialogService],
})
export class ConsultaConvenioPrevisionFunerariaModule {}
