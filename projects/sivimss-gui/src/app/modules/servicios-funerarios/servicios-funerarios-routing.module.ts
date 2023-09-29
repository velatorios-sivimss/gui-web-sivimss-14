import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";

import {ServiciosFunerariosComponent} from "./components/servicios-funerarios/servicios-funerarios.component";
import {
  DetalleServiciosFunerariosComponent
} from "./components/detalle-servicios-funerarios/detalle-servicios-funerarios.component";
import {
  AltaServiciosFunerariosComponent
} from "./components/alta-servicios-funerarios/alta-servicios-funerarios.component";
import {
  CancelarServiciosFunerariosComponent
} from "./components/cancelar-servicios-funerarios/cancelar-servicios-funerarios.component";
import {
  ModificarServiciosFunerariosComponent
} from "./components/modificar-servicios-funerarios/modificar-servicios-funerarios.component";
import {ServiciosFunerariosResolver} from "./services/servicios-funerarios.resolver";
import {ServiciosFunerariosConsultaResolver} from "./services/servicios-funerarios-consulta.resolver";
import {DetallePagoResolver} from "./services/detalle-pago.resolver";

const routes: Routes = [
  {
    path:'',
    component: ServiciosFunerariosComponent,
    resolve: {
      respuesta: ServiciosFunerariosConsultaResolver
    }
  },
  {
    path:'detalle-pago',
    component: DetalleServiciosFunerariosComponent,
    resolve: {
      respuesta: DetallePagoResolver
    }
  },
  {
    path:'cancelar-pago/:id',
    component: CancelarServiciosFunerariosComponent,
  },
  {
    path:'modificar-pago',
    component: ModificarServiciosFunerariosComponent,
    resolve: {
      respuesta: ServiciosFunerariosResolver
    }
  },
  {
    path:'registrar-nuevo-plan-sfpa',
    component: AltaServiciosFunerariosComponent,
    resolve: {
      respuesta: ServiciosFunerariosResolver
    }
  }
];

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule],
  providers: [
    ServiciosFunerariosResolver,
    ServiciosFunerariosConsultaResolver,
    DetallePagoResolver
  ]
})

export class ServiciosFunerariosRoutingModule {

}
