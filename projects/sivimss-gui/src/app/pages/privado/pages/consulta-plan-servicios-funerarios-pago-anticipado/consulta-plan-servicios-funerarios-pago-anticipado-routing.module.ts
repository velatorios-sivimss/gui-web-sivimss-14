import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaPlanServiciosFunerariosPagoAnticipadoComponent } from './consulta-plan-servicios-funerarios-pago-anticipado.component';

const routes: Routes = [
  {
    path: '',
    component: ConsultaPlanServiciosFunerariosPagoAnticipadoComponent,
  },
  {
    path: 'mi-plan-de-servicios-funerarios-pago-anticipado',
    loadChildren: () =>
      import(
        './pages/mi-plan-servicios-funerarios-pago-anticipado/mi-plan-servicios-funerarios-pago-anticipado.module'
      ).then((m) => m.MiPlanServiciosFunerariosPagoAnticipadoModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaPlanServiciosFunerariosPagoAnticipadoRoutingModule {}
