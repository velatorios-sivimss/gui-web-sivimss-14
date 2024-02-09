import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  MapaContratarConvenioPrevisionFunerariaComponent
} from './mapa-contratar-convenio-prevision-funeraria.component';
import {ReciboPagoLineaComponent} from "./pages/recibo-pago-linea/recibo-pago-linea.component";
import {ReciboDePagoResolver} from "./services/recibo-de-pago.resolver";

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
    path: 'registro-contratacion-convenio-de-prevision-funeraria/recibo-de-pago/:idFolio',
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
export class MapaContratarConvenioPrevisionFunerariaRoutingModule {
}
