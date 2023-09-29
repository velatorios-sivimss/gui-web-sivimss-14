import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CapillaReservacionComponent} from "./components/capilla-reservacion/capilla-reservacion.component";
import { CapillaReservacionResolver } from "./services/capilla-reservacion-resolver.service";

const routes: Routes = [
  {
    path:'',
    component: CapillaReservacionComponent,
    resolve: {
      respuesta: CapillaReservacionResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CapillaReservacionResolver]
})

export class CapillaReservacionRoutingModule {

}
