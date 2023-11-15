import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaEstatusOrdenServicioComponent } from './consulta-estatus-orden-servicio.component';

const routes: Routes = [
  { path: '', component: ConsultaEstatusOrdenServicioComponent },
  {
    path: 'mi-orden-de-servicio',
    loadChildren: () =>
      import('./pages/mi-orden-servicio/mi-orden-servicio.module').then(
        (m) => m.MiOrdenServicioModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaEstatusOrdenServicioRoutingModule {}
