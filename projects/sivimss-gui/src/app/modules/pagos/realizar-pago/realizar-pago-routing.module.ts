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

const routes: Routes = [
  {
    path: '',
    component: RealizarPagoComponent
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
    path: 'detalle-de-pago',
    component: DetalleMetodoPagoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealizarPagoRoutingModule {
}
