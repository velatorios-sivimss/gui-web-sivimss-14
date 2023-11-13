import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContratarConvenioPrevisionFunerariaComponent } from './contratar-convenio-prevision-funeraria.component';

const routes: Routes = [
  { path: '', component: ContratarConvenioPrevisionFunerariaComponent },
  {
    path: 'registro-de-persona-del-grupo',
    loadChildren: () =>
      import(
        './pages/registro-persona-grupo/registro-persona-grupo.module'
      ).then((m) => m.RegistroPersonaGrupoModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContratarConvenioPrevisionFunerariaRoutingModule {}
