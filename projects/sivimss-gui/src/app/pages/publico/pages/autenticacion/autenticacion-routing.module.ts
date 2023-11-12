import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionComponent } from './autenticacion.component';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';

const routes: Routes = [
  {
    path: '',
    component: AutenticacionComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio-sesion',
        pathMatch: 'full',
      },
      {
        path: 'inicio-sesion',
        component: InicioSesionComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutenticacionRoutingModule {}
