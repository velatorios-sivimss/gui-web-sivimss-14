import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { CuotasComponent } from './components/cuotas/cuotas.component';
import { CuotasResolver } from './services/cuotas.resolver';

const routes: Route[] = [{
  path: '',
  component: CuotasComponent,
  resolve: {
    respuesta: CuotasResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CuotasResolver
  ]
})
export class CuotasRoutingModule {
}
