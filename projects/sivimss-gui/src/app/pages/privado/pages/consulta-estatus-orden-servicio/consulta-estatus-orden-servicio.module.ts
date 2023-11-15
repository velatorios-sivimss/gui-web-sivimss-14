import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsultaEstatusOrdenServicioRoutingModule } from './consulta-estatus-orden-servicio-routing.module';
import { ConsultaEstatusOrdenServicioComponent } from './consulta-estatus-orden-servicio.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [ConsultaEstatusOrdenServicioComponent],
  imports: [
    CommonModule,
    ConsultaEstatusOrdenServicioRoutingModule,
    TableModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    DialogModule,
  ],
  providers: [DialogService],
})
export class ConsultaEstatusOrdenServicioModule {}
