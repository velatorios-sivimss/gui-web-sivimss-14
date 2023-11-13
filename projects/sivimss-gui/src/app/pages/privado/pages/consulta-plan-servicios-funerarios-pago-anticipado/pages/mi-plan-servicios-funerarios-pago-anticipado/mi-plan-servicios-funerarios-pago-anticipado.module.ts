import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiPlanServiciosFunerariosPagoAnticipadoRoutingModule } from './mi-plan-servicios-funerarios-pago-anticipado-routing.module';
import { MiPlanServiciosFunerariosPagoAnticipadoComponent } from './mi-plan-servicios-funerarios-pago-anticipado.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [MiPlanServiciosFunerariosPagoAnticipadoComponent],
  imports: [
    CommonModule,
    MiPlanServiciosFunerariosPagoAnticipadoRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
  ],
})
export class MiPlanServiciosFunerariosPagoAnticipadoModule {}
