import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermiteUsuarioLogueadoGuard} from "../../guards/permite-usuario-logueado.guard";

const routes: Routes = [
  {
    path: 'generar-recibo-pago',
    loadChildren: () => import('./generar-recibo-pago/generar-recibo-pago.module').then(m => m.GenerarReciboModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'generar-formato-pagare',
    loadChildren: () => import('./generar-formato-pagare/generar-formato-pagare.module').then(m => m.GenerarFormatoPagareModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'facturacion',
    loadChildren: () => import('./facturacion/facturacion.module').then(m => m.FacturacionModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'realizar-pago',
    loadChildren: () => import('./realizar-pago/realizar-pago.module').then(m => m.RealizarPagoModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'gestionar-pago',
    loadChildren: () => import('./gestionar-pago/gestionar-pago.module').then(m => m.GestionarPagoModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagosRoutingModule {
}
