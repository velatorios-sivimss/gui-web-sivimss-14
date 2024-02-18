import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiPlanServiciosFunerariosPagoAnticipadoComponent } from './mi-plan-servicios-funerarios-pago-anticipado.component';
import { ReciboDePagoResolver } from '../../../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/recibo-de-pago.resolver';
import { ReciboPagoLineaComponent } from '../../../mapa-contratar-plan-servicios-funerarios-pago-anticipado/pages/recibo-pago-linea/recibo-pago-linea.component';

const routes: Routes = [
  { path: '', component: MiPlanServiciosFunerariosPagoAnticipadoComponent },
  {
    path: 'recibo-de-pago/:idFolio',
    component: ReciboPagoLineaComponent,
    resolve: {
      respuesta: ReciboDePagoResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ReciboDePagoResolver]
})
export class MiPlanServiciosFunerariosPagoAnticipadoRoutingModule { }
