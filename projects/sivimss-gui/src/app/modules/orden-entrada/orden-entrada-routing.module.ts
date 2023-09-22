import { RouterModule, Routes } from "@angular/router";
import { CancelarOrdenEntradaComponent } from "projects/sivimss-gui/src/app/modules/orden-entrada/components/cancelar-orden-entrada/cancelar-orden-entrada.component";
import { OrdenEntradaComponent } from "./components/orden-entrada/orden-entrada.component";
import { NgModule } from "@angular/core";
import { OrdenEntradaResolver } from "./services/orden-entrada.resolver";
import { GenerarOdeComponent } from "./components/generar-ode/generar-ode.component";
import { DevolverArticuloComponent } from './components/devolver-articulo/devolver-articulo.component';

const routes: Routes = [
  {
    path: '',
    component: OrdenEntradaComponent,
    resolve: {
      respuesta: OrdenEntradaResolver
    }
  },
  {
    path: 'generar-ode',
    component: GenerarOdeComponent
  },
  {
    path: 'cancelar-orden-entrada/:id',
    component: CancelarOrdenEntradaComponent
  },
  {
    path: 'devolucion-articulo/:folio',
    component: DevolverArticuloComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OrdenEntradaResolver]
})
export class OrdenEntradaRoutingModule { }
