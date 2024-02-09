import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component';

const routes: Routes = [
  {
    path: '',
    component: MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent,
  },
  {
    path: 'registro-contratacion-plan-de-servicios-funerarios-pago-anticipado',
    loadChildren: () =>
      import(
        './pages/contratar-plan-servicios-funerarios-pago-anticipado/contratar-plan-servicios-funerarios-pago-anticipado.module'
      ).then((m) => m.ContratarPlanServiciosFunerariosPagoAnticipadoModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule {}
