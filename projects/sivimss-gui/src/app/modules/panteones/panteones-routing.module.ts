import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { PanteonesComponent } from './components/panteones/panteones.component';
import { PanteonesResolver } from './services/panteones.resolver';

const routes: Route[] = [{
  path: '',
  component: PanteonesComponent,
  resolve: {
    respuesta: PanteonesResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    PanteonesResolver
  ]
})
export class PanteonesRoutingModule {
}
