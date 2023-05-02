import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { ContratosComponent } from './components/contratos/contratos.component';
import { ContratosResolver } from './services/contratos.resolver';

const routes: Route[] = [{
  path: '',
  component: ContratosComponent,
  resolve: {
    respuesta: ContratosResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ContratosResolver
  ]
})
export class ContratosRoutingModule {
}
