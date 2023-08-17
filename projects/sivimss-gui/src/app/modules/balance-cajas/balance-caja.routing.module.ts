import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import { BalanceCajaComponent } from "./components/balance-caja/balance-caja.component";
import { ModificarPagoComponent } from "./components/modificar-pago/modificar-pago.component";
import { BalanceCajaResolver } from "./services/balance-caja.resolver"; 

const routes: Route[] = [
  {
    path: '',
    component: BalanceCajaComponent,
    resolve: {
      respuesta: BalanceCajaResolver,
    },
    data: {
      validaRol: {
        funcionalidad: 'GENERAR_RECIBO_PAGO',
        permiso: 'CONSULTA'
      }
    },
  },
  {
   path: 'modificar-pago',
   component: ModificarPagoComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    BalanceCajaResolver,
  ]
})
export class CalculoComisionesoRoutingModule {
}
