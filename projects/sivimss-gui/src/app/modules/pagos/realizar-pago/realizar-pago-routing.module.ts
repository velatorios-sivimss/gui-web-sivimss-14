import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RealizarPagoComponent} from "./components/realizar-pago/realizar-pago.component";
import {PagoOrdenServicioComponent} from "./components/pago-orden-servicio/pago-orden-servicio.component";
import {PagoConvenioComponent} from "./components/pago-convenio/pago-convenio.component";
import {
  PagoRenovacionConvenioComponent
} from "./components/pago-renovacion-convenio/pago-renovacion-convenio.component";
import {
  SeleccionBeneficiariosAgfComponent
} from "./components/seleccion-beneficiarios-agf/seleccion-beneficiarios-agf.component";
import {DetalleMetodoPagoComponent} from "./components/detalle-metodo-pago/detalle-metodo-pago.component";
import {RealizarPagoResolver} from "./services/realizar-pago.resolver";
import {DetallePagoResolver} from "./services/detalle-pago.resolver";
import {ModificarMetodoPagoComponent} from "./components/modificar-metodo-pago/modificar-metodo-pago.component";

const routes: Routes = [
  {
    path: '',
    component: RealizarPagoComponent,
    resolve: {
      respuesta: RealizarPagoResolver
    }
  },
  {
    path: 'pago-orden-servicio',
    component: PagoOrdenServicioComponent
  },
  {
    path: 'pago-convenio-prevision-funeraria',
    component: PagoConvenioComponent
  },
  {
    path: 'pago-renovacion-convenio-prevision-funeraria',
    component: PagoRenovacionConvenioComponent
  },
  {
    path: 'agf-seleccion-beneficiarios',
    component: SeleccionBeneficiariosAgfComponent
  },
  {
    path: 'detalle-de-pago/:idPagoBitacora',
    component: DetalleMetodoPagoComponent,
    resolve: {
      respuesta: DetallePagoResolver
    }
  },
  {
    path: 'modificar-metodo-de-pago/:idPagoBitacora',
    component: ModificarMetodoPagoComponent,
    resolve: {
      respuesta: DetallePagoResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [RealizarPagoResolver, DetallePagoResolver]
})
export class RealizarPagoRoutingModule {
}
