import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {GenerarReciboPagoComponent} from './components/generar-recibo-pago/generar-recibo-pago.component';
import {ReciboPagoTramitesComponent} from './components/recibo-pago-tramites/recibo-pago-tramites.component';
import {GenerarReciboResolver} from './services/generar-recibo-pago.resolver';
import {ReciboPagoTramitesResolver} from "./services/recibo-pago-tramites.resolver";

const routes: Route[] = [
  {
    path: '',
    component: GenerarReciboPagoComponent,
    resolve: {
      respuesta: GenerarReciboResolver,
    }
  },
  {
    path: 'generar-recibo-pago-tramites/:idPagoBitacora',
    component: ReciboPagoTramitesComponent,
    resolve: {
      respuesta: ReciboPagoTramitesResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [GenerarReciboResolver, ReciboPagoTramitesResolver]
})
export class GenerarReciboRoutingModule {
}
