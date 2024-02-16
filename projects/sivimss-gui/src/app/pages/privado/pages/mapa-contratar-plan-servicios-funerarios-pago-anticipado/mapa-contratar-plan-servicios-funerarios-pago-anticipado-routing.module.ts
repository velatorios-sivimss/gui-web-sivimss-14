import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component';
import { ReciboPagoLineaComponent } from './pages/recibo-pago-linea/recibo-pago-linea.component';
import { ReciboDePagoResolver } from './services/recibo-de-pago.resolver';

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
  },
  {
    path: 'registro-contratacion-plan-de-servicios-funerarios-pago-anticipado/recibo-de-pago/:idFolio',
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
export class MapaContratarPlanServiciosFunerariosPagoAnticipadoRoutingModule {}
