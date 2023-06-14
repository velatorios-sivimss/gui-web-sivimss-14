import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {GenerarReciboPagoComponent} from './components/generar-recibo-pago/generar-recibo-pago.component';
import {ReciboPagoTramitesComponent} from './components/recibo-pago-tramites/recibo-pago-tramites.component';
import {GenerarReciboResolver} from './services/generar-recibo-pago.resolver';
import {ReciboPagoTramitesResolver} from "./services/recibo-pago-tramites.resolver";
import {DetallePagoTramitesComponent} from "./components/detalle-pago-tramites/detalle-pago-tramites.component";
import {DetalleReciboTramitesResolver} from "./services/detalle-recibo-pago.resolver";

const routes: Route[] = [
  {
    path: '',
    component: GenerarReciboPagoComponent,
    resolve: {
      respuesta: GenerarReciboResolver,
    },
    data: {
      validaRol: {
        funcionalidad: 'GENERAR_RECIBO_PAGO',
        permiso: 'CONSULTA'
      }
    },
  },
  {
    path: 'generar-recibo-pago-tramites/:idPagoBitacora',
    component: ReciboPagoTramitesComponent,
    resolve: {
      respuesta: ReciboPagoTramitesResolver
    }
  },
  {
    path: 'detalle-recibo-pago-tramites/:idRecibo',
    component: DetallePagoTramitesComponent,
    resolve: {
      respuesta: DetalleReciboTramitesResolver
    },
    data: {
      validaRol: {
        funcionalidad: 'GENERAR_RECIBO_PAGO',
        permiso: 'CONSULTA'
      }
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [GenerarReciboResolver, ReciboPagoTramitesResolver,
    DetalleReciboTramitesResolver]
})
export class GenerarReciboRoutingModule {
}
