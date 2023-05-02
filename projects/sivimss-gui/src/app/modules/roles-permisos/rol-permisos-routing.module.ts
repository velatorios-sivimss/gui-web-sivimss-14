import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidaRolGuard } from "projects/sivimss-gui/src/app/guards/valida-rol.guard";
import { RolesPermisosComponent } from './components/roles-permisos/roles-permisos.component';
import { AgregarRolPermisosComponent } from "./components/agregar-rol-permisos/agregar-rol-permisos.component";
import { RolPermisosResolver } from './services/rol-permisos.resolver';

const routes: Routes = [
  {
    path: '',
    component: RolesPermisosComponent,
    /*  resolve: {
        respuesta: RolPermisosResolver,
      },*/
  },
  {
    path: 'agregar-rol-permisos',
    component: AgregarRolPermisosComponent,
    data: {
      validaRol: {
        funcionalidad: 'ROLES_PERMISOS',
        permiso: 'ALTA'
      }
    },
    canActivate: [ValidaRolGuard]
    /* resolve: {
       respuesta: RolPermisosResolver,
     }, */
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    RolPermisosResolver,
  ],
})
export class RolPermisosRoutingModule {
}
