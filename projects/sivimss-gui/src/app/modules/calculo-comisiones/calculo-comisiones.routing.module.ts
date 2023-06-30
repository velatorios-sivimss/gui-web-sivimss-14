import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import { ComisionesComponent } from "./components/comisiones/comisiones.component";
import { CalculoComisionesResolver } from "./services/calculo-comisiones.resolver"; 
import { DetalleComisionResolver } from "./services/detalle-comision.resolver"; 
import { DetalleComisionComponent } from "./components/detalle-comision/detalle-comision.component"; 

const routes: Route[] = [
  {
    path: '',
    component: ComisionesComponent,
    resolve: {
      respuesta: CalculoComisionesResolver,
    },
    data: {
      validaRol: {
        funcionalidad: 'GENERAR_RECIBO_PAGO',
        permiso: 'CONSULTA'
      }
    },
  },
  {
    path: 'detalle-comision/:id',
    component: DetalleComisionComponent,
    resolve: {
      respuesta: DetalleComisionResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CalculoComisionesResolver,
    DetalleComisionResolver
  ]
})
export class CalculoComisionesoRoutingModule {
}
