import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {VelatoriosComponent} from "./components/velatorios/velatorios.component";
import {VelatorioResolver} from "./services/velatorio.resolver";

const routes: Routes = [{
  path: '',
  component: VelatoriosComponent,
  resolve: {
    respuesta: VelatorioResolver,
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [VelatorioResolver]
})
export class VelatoriosRoutingModule {
}
