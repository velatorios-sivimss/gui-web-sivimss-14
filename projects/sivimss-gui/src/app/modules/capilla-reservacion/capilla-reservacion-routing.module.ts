import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CapillaReservacionComponent} from "./components/capilla-reservacion/capilla-reservacion.component";

const routes: Routes = [
  {
    path:'',
    component: CapillaReservacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CapillaReservacionRoutingModule {

}
