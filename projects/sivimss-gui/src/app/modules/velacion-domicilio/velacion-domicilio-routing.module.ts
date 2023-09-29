import { RouterModule, Routes } from "@angular/router";
import { VelacionDomicilioComponent } from "./components/velacion-domicilio/velacion-domicilio.component";
import { NgModule } from "@angular/core";
import {
  DetalleVelacionDomicilioComponent
} from "./components/detalle-velacion-domicilio/detalle-velacion-domicilio.component";
import { GenerarValeSalidaComponent } from "./components/generar-vale-salida/generar-vale-salida.component";
import { VelacionDomicilioResolver } from "./services/velacion-domicilio.resolver";
import { VelacionDomicilioDetalleResolver } from "./services/velacion-domicilio-detalle.resolver";

const routes: Routes = [
  {
    path: '',
    component: VelacionDomicilioComponent,
    resolve: {
      respuesta: VelacionDomicilioResolver
    }
  },
  {
    path: 'generar-vale-salida',
    component: GenerarValeSalidaComponent,
    resolve: {
      respuesta: VelacionDomicilioResolver
    }
  },
  {
    path: 'ver-detalle/:idValeSalida',
    component: DetalleVelacionDomicilioComponent,
    resolve: {
      respuesta: VelacionDomicilioDetalleResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    VelacionDomicilioResolver,
    VelacionDomicilioDetalleResolver,
  ]
})

export class VelacionDomicilioRoutingModule {

}
