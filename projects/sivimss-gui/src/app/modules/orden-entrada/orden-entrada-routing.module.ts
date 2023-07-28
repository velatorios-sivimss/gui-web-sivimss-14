import {Router, RouterModule, Routes} from "@angular/router";
import {OrdenEntradaComponent} from "./components/orden-entrada/orden-entrada.component";
import {NgModule} from "@angular/core";
import {OrdenEntradaResolver} from "./services/orden-entrada.resolver";

const routes: Routes = [
  {
    path: '',
    component: OrdenEntradaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[OrdenEntradaResolver]
})
export class OrdenEntradaRoutingModule{}
