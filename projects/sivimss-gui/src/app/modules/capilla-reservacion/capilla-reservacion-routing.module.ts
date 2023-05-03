import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CapillaReservacionComponent} from "./components/capilla-reservacion/capilla-reservacion.component";
import { capillaReservacionResolver } from "./services/capilla-reservacion.resolver";

const routes: Routes = [
  {
    path:'',
    component: CapillaReservacionComponent,
    resolve: {
      respuesta: capillaReservacionResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [capillaReservacionResolver]
})

export class CapillaReservacionRoutingModule {

}
