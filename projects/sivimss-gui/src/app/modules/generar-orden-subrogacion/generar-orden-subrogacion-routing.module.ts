import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GenerarOrdenSubrogacionComponent } from "./components/generar-orden-subrogacion/generar-orden-subrogacion.component";
import { GenerarOrdenSubrogacionResolver } from "./services/generar-orden-subrogacion.resolver";
import { GenerarOrdenFormatoComponent } from "./components/generar-orden-formato/generar-orden-formato.component";

const routes: Routes = [
  {
    path: '',
    component: GenerarOrdenSubrogacionComponent,
    resolve: {
      respuesta: GenerarOrdenSubrogacionResolver,
    },
  },
  {
    path: 'formato/:idOrden',
    component: GenerarOrdenFormatoComponent,
    resolve: {
      respuesta: GenerarOrdenSubrogacionResolver
    },
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GenerarOrdenSubrogacionResolver,
  ]
})

export class GenerarOrdenSubrogacionRoutingModule { }
