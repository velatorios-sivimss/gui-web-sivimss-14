import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ConsultaDonacionesComponent} from "./components/consulta-donaciones/consulta-donaciones.component";
import {
  AceptacionDonacionComponent
} from "./components/aceptacion-donacion/aceptacion-donacion.component";
import {
  ControlSalidaDonacionesComponent
} from "./components/control-salida-donaciones/control-salida-donaciones.component";
import { DonacionesResolver } from "./services/donaciones.resolver";
import {GestionarDonacionesResolver} from "./services/gestionar-donaciones.resolver";

const routes: Routes = [
  {
    path:'',
    component: ConsultaDonacionesComponent,
    resolve: {
      respuesta: DonacionesResolver,
    }
  },
  {
    path:'aceptacion-donacion',
    component: AceptacionDonacionComponent,
    resolve: {
      respuesta: GestionarDonacionesResolver,
    }
  },
  {
    path:'control-salida-donaciones',
    component: ControlSalidaDonacionesComponent,
    resolve: {
      respuesta: GestionarDonacionesResolver,
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    DonacionesResolver,
    GestionarDonacionesResolver
  ]
})

export class ConsultaDonacionesRoutingModule {

}
