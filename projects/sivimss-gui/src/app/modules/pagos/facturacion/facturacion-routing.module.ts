import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FacturacionComponent} from "./components/facturacion/facturacion.component";

const routes: Routes = [
  {
    path: '',
    component: FacturacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule {
}
