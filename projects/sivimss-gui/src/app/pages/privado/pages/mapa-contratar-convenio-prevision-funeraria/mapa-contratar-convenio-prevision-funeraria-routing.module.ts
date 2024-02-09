import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  MapaContratarConvenioPrevisionFunerariaComponent
} from './mapa-contratar-convenio-prevision-funeraria.component';
import {ReciboPagoLineaComponent} from "./pages/recibo-pago-linea/recibo-pago-linea.component";

const routes: Routes = [
  {path: '', component: MapaContratarConvenioPrevisionFunerariaComponent},
  {
    path: 'registro-contratacion-convenio-de-prevision-funeraria',
    loadChildren: () =>
      import(
        './pages/contratar-convenio-prevision-funeraria/contratar-convenio-prevision-funeraria.module'
        ).then((m) => m.ContratarConvenioPrevisionFunerariaModule),
  },
  {
    path: 'registro-contratacion-convenio-de-prevision-funeraria/recibo-de-pago',
    component: ReciboPagoLineaComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaContratarConvenioPrevisionFunerariaRoutingModule {
}
