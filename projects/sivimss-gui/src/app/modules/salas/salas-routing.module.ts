import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { SalasComponent } from './components/salas/salas.component';
import { SalasResolver } from './services/salas.resolver';

const routes: Route[] = [{
  path: '',
  component: SalasComponent,
  resolve: {
    respuesta: SalasResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    SalasResolver
  ]
})
export class SalasRoutingModule {
}
