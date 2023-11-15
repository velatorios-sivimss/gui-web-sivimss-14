import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiPlanServiciosFunerariosPagoAnticipadoComponent } from './mi-plan-servicios-funerarios-pago-anticipado.component';

const routes: Routes = [{ path: '', component: MiPlanServiciosFunerariosPagoAnticipadoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiPlanServiciosFunerariosPagoAnticipadoRoutingModule { }
