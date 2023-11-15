import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicoComponent } from './publico.component';

const routes: Routes = [
  {
    path: '',
    component: PublicoComponent,
    children: [
      {
        path: '',
        redirectTo: 'autenticacion',
        pathMatch: 'full',
      },
      {
        path: 'autenticacion',
        loadChildren: () =>
          import('./pages/autenticacion/autenticacion.module').then(
            (m) => m.AutenticacionModule
          ),
      },
      {
        path: 'registro-en-linea',
        loadChildren: () =>
          import('./pages/registro/registro.module').then(
            (m) => m.RegistroModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicoRoutingModule {}
