import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { PromotoresComponent } from './components/promotores/promotores.component';
import { PromotoresResolver } from './services/promotores.resolver';

const routes: Route[] = [{
  path: '',
  component: PromotoresComponent,
  resolve: {
    respuesta: PromotoresResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    PromotoresResolver
  ]
})
export class PromotoresRoutingModule {
}
