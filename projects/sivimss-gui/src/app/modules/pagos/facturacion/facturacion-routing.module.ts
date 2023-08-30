import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FacturacionComponent} from "./components/facturacion/facturacion.component";
import {CancelarFacturaComponent} from "./components/cancelar-factura/cancelar-factura.component";
import {EnviarFacturaComponent} from "./components/enviar-factura/enviar-factura.component";
import {SolicitarFacturaComponent} from "./components/solicitar-factura/solicitar-factura.component";
import {FacturacionResolver} from "./services/facturacion.resolver";

const routes: Routes = [
  {
    path: '',
    component: FacturacionComponent,
  },
  {
    path: 'cancelar-factura',
    component: CancelarFacturaComponent
  },
  {
    path: 'enviar-factura',
    component: EnviarFacturaComponent
  },
  {
    path: 'solicitar-factura',
    component: SolicitarFacturaComponent,
    resolve: {
      respuesta: FacturacionResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [FacturacionResolver]
})
export class FacturacionRoutingModule {
}
