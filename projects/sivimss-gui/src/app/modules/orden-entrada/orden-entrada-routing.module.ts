import {Router, RouterModule, Routes} from "@angular/router";
import {OrdenEntradaComponent} from "./components/orden-entrada/orden-entrada.component";
import {NgModule} from "@angular/core";
import {OrdenEntradaResolver} from "./services/orden-entrada.resolver";
import {GenerarOdeComponent} from "./components/generar-ode/generar-ode.component";

const routes: Routes = [
  {
    path: '',
    component: OrdenEntradaComponent,
    resolve: {
      respuesta: OrdenEntradaResolver
    }
  },
  {
    path:'generar-ode',
    component: GenerarOdeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[OrdenEntradaResolver]
})
export class OrdenEntradaRoutingModule{}
