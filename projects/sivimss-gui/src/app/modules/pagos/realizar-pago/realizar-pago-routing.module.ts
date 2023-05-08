import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RealizarPagoComponent} from "./components/realizar-pago/realizar-pago.component";

const routes: Routes = [
  {
    path: '',
    component: RealizarPagoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealizarPagoRoutingModule {
}
