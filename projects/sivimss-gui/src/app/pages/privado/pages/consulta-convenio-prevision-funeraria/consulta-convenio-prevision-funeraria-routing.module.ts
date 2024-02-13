import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaConvenioPrevisionFunerariaComponent } from './consulta-convenio-prevision-funeraria.component';
import { MiConvenioPrevisionFunerariaModule } from './pages/mi-convenio-prevision-funeraria/mi-convenio-prevision-funeraria.module';
import {
  ReciboPagoLineaComponent
} from "../mapa-contratar-convenio-prevision-funeraria/pages/recibo-pago-linea/recibo-pago-linea.component";
import {ReciboDePagoResolver} from "../mapa-contratar-convenio-prevision-funeraria/services/recibo-de-pago.resolver";

const routes: Routes = [
  { path: '', component: ConsultaConvenioPrevisionFunerariaComponent },
  {
    path: 'mi-convenio-de-prevision-funeraria',
    loadChildren: () =>
      import(
        './pages/mi-convenio-prevision-funeraria/mi-convenio-prevision-funeraria.module'
      ).then((m) => m.MiConvenioPrevisionFunerariaModule),
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
export class ConsultaConvenioPrevisionFunerariaRoutingModule {}
