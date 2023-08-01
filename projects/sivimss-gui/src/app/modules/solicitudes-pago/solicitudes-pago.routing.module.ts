import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import { SolicitudesPagoComponent } from "./components/solicitudes-pago/solicitudes-pago.component";
import { SolicitudesPagoResolver } from "./services/solicitudes-pago.resolver"; 

const routes: Route[] = [
  {
    path: '',
    component: SolicitudesPagoComponent,
    resolve: {
      respuesta: SolicitudesPagoResolver,
    },
    data: {
      validaRol: {
        funcionalidad: 'GENERAR_SOLICITUD_PAGO',
        permiso: 'CONSULTA'
      }
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    SolicitudesPagoResolver
  ]
})
export class SolicitudesPagoRoutingModule {
}
