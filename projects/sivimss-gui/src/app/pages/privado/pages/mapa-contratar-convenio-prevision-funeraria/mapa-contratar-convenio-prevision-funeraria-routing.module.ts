import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaContratarConvenioPrevisionFunerariaComponent } from './mapa-contratar-convenio-prevision-funeraria.component';

const routes: Routes = [
  { path: '', component: MapaContratarConvenioPrevisionFunerariaComponent },
  {
    path: 'registro-contratacion-convenio-de-prevision-funeraria',
    loadChildren: () =>
      import(
        './pages/contratar-convenio-prevision-funeraria/contratar-convenio-prevision-funeraria.module'
      ).then((m) => m.ContratarConvenioPrevisionFunerariaModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaContratarConvenioPrevisionFunerariaRoutingModule {}
