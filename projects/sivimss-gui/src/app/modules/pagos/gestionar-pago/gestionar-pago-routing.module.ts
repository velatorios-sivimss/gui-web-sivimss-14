import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GestionarPagoResolver} from "./services/gestionar-pago.resolver";
import {GestionarPagoComponent} from "./components/gestionar-pago/gestionar-pago.component";
import {DetalleGestionPagoComponent} from "./components/detalle-gestion-pago/detalle-gestion-pago.component";
import {DetalleGestionPagoResolver} from "./services/detalle-gestion-pago.resolver";
import {IrAPagoComponent} from "./components/ir-a-pago/ir-a-pago.component";

const routes: Routes = [
  {
    path: '',
    component: GestionarPagoComponent,
    resolve: {
      respuesta: GestionarPagoResolver
    }
  },
  {
    path: 'modificar-de-pago/:idPagoBitacora/:idFlujo',
    component: DetalleGestionPagoComponent,
    resolve: {
      respuesta: DetalleGestionPagoResolver
    }
  },
  {
    path: 'detalle-de-pago/:idPagoBitacora/:idFlujo',
    component: IrAPagoComponent,
    resolve: {
      respuesta: DetalleGestionPagoResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [GestionarPagoResolver, DetalleGestionPagoResolver]
})
export class GestionarPagoRoutingModule {
}
