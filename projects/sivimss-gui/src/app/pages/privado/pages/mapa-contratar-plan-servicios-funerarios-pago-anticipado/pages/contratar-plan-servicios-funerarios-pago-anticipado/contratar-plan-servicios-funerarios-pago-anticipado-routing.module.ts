import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './contratar-plan-servicios-funerarios-pago-anticipado.component';

const routes: Routes = [{ path: '', component: ContratarPlanServiciosFunerariosPagoAnticipadoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule { }
