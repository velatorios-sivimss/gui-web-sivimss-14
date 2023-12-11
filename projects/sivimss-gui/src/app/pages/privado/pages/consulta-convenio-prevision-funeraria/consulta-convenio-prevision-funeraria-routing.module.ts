import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaConvenioPrevisionFunerariaComponent } from './consulta-convenio-prevision-funeraria.component';
import { MiConvenioPrevisionFunerariaModule } from './pages/mi-convenio-prevision-funeraria/mi-convenio-prevision-funeraria.module';

const routes: Routes = [
  { path: '', component: ConsultaConvenioPrevisionFunerariaComponent },
  {
    path: 'mi-convenio-de-prevision-funeraria',
    loadChildren: () =>
      import(
        './pages/mi-convenio-prevision-funeraria/mi-convenio-prevision-funeraria.module'
      ).then((m) => m.MiConvenioPrevisionFunerariaModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaConvenioPrevisionFunerariaRoutingModule {}
