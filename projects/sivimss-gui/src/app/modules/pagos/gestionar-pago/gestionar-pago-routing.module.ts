import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GestionarPagoResolver} from "./services/gestionar-pago.resolver";
import {GestionarPagoComponent} from "./components/gestionar-pago/gestionar-pago.component";

const routes: Routes = [{
  path: '',
  component: GestionarPagoComponent,
  resolve: {
    respuesta: GestionarPagoResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [GestionarPagoResolver]
})
export class GestionarPagoRoutingModule {
}
