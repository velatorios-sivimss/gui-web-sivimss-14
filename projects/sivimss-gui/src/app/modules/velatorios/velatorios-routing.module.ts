import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {VelatoriosComponent} from "./components/velatorios/velatorios.component";
import {VelatorioResolver} from "./services/velatorio.resolver";
import {ValidaRolGuard} from "../../guards/valida-rol.guard";

const routes: Routes = [{
  path: '',
  component: VelatoriosComponent,
  resolve: {
    respuesta: VelatorioResolver,
  },
  data: {
    validaRol: {
      funcionalidad: 'VELATORIOS',
      permiso: 'CONSULTA'
    }
  },
  canActivate: [ValidaRolGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [VelatorioResolver]
})
export class VelatoriosRoutingModule {
}
