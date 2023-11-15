import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComprobantePagoRoutingModule } from './comprobante-pago-routing.module';
import { ComprobantePagoComponent } from './comprobante-pago.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { TablePanelModule } from 'projects/sivimss-gui/src/app/shared/table-panel/table-panel.module';

@NgModule({
  declarations: [ComprobantePagoComponent],
  imports: [
    CommonModule,
    ComprobantePagoRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TablePanelModule
  ],
})
export class ComprobantePagoModule {}
