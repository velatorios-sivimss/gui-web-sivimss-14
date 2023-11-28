import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiConvenioPrevisionFunerariaComponent } from './mi-convenio-prevision-funeraria.component';

const routes: Routes = [
  { path: '', component: MiConvenioPrevisionFunerariaComponent },
  {
    path: 'comprobante-de-pago',
    loadChildren: () =>
      import('./pages/comprobante-pago/comprobante-pago.module').then(
        (m) => m.ComprobantePagoModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiConvenioPrevisionFunerariaRoutingModule {}
