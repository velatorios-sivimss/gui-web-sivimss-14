import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './components/roles/roles.component';
import { AgregarRolComponent } from "./components/agregar-rol/agregar-rol.component";
import { RolResolver } from './services/rol.resolver';

const routes: Routes = [
  {
    path: '', 
    component: RolesComponent,
    resolve: {
      respuesta: RolResolver,
    },
  },
  {
    path: 'agregar-rol',
    component: AgregarRolComponent,
    resolve: {
      respuesta: RolResolver,
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    RolResolver,
  ],
})
export class RolesRoutingModule {
}
