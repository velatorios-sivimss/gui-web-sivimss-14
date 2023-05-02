import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidaRolGuard } from "projects/sivimss-gui/src/app/guards/valida-rol.guard";
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { UsuarioResolver } from './services/usuario.resolver';

const routes: Routes = [{
  path: '', component: UsuariosComponent,
  resolve: {
    respuesta: UsuarioResolver,
  },
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UsuarioResolver],
})
export class UsuariosRoutingModule {
}
