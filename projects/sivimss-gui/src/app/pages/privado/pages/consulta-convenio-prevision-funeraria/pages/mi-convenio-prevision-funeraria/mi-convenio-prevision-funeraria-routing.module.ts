import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiConvenioPrevisionFunerariaComponent } from './mi-convenio-prevision-funeraria.component';
import { ReciboPagoLineaComponent } from '../../../mapa-contratar-convenio-prevision-funeraria/pages/recibo-pago-linea/recibo-pago-linea.component';
import { ReciboDePagoResolver } from '../../../mapa-contratar-convenio-prevision-funeraria/services/recibo-de-pago.resolver';

const routes: Routes = [
  { path: '', component: MiConvenioPrevisionFunerariaComponent },
  {
    path: 'comprobante-de-pago',
    loadChildren: () =>
      import('./pages/comprobante-pago/comprobante-pago.module').then(
        (m) => m.ComprobantePagoModule
      ),
  },
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
export class MiConvenioPrevisionFunerariaRoutingModule {}
