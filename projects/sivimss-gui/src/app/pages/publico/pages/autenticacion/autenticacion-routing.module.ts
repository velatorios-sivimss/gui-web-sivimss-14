import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionComponent } from './autenticacion.component';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { ActualizarContraseniaComponent } from './components/actualizar-contrasenia/actualizar-contrasenia.component';
import { RestablecerContraseniaComponent } from './components/restablecer-contrasenia/restablecer-contrasenia.component';

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
      {
        path: 'actualizar-contrasenia', component: ActualizarContraseniaComponent
      },
      {
        path: 'restablecer-contrasenia', component: RestablecerContraseniaComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutenticacionRoutingModule {}
