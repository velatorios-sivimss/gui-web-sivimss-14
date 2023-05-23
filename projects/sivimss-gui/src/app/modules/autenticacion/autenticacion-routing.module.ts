import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InicioAutenticacionComponent} from './components/inicio-autenticacion/inicio-autenticacion.component';
import {InicioSesionComponent} from './components/inicio-sesion/inicio-sesion.component';
import {
  ActualizarContraseniaComponent
} from 'projects/sivimss-gui/src/app/modules/autenticacion/components/actualizar-contrasenia/actualizar-contrasenia.component';
import {RestablecerContraseniaComponent} from "./components/restablecer-contrasenia/restablecer-contrasenia.component";

const routes: Routes = [
  {
    path: '', component: InicioAutenticacionComponent,
    children: [
      {
        path: '', component: InicioSesionComponent,
      },
      {
        path: 'actualizar-contrasenia', component: ActualizarContraseniaComponent
      },
      {
        path: 'restablecer-contrasenia', component: RestablecerContraseniaComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutenticacionRoutingModule {
}
