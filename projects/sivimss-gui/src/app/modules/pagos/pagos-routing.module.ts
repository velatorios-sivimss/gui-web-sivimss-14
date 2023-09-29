import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermiteUsuarioLogueadoGuard} from "../../guards/permite-usuario-logueado.guard";
import {PaginaNoEncontradaComponent} from "../../components/pagina-no-encontrada/pagina-no-encontrada.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PaginaNoEncontradaComponent
  },
  {
    path: '',
    canActivate: [PermiteUsuarioLogueadoGuard],
    children: [
      {
        path: 'generar-recibo-pago',
        loadChildren: () => import('./generar-recibo-pago/generar-recibo-pago.module').then(m => m.GenerarReciboModule),
      },
      {
        path: 'generar-formato-pagare',
        loadChildren: () => import('./generar-formato-pagare/generar-formato-pagare.module').then(m => m.GenerarFormatoPagareModule),
      },
      {
        path: 'facturacion',
        loadChildren: () => import('./facturacion/facturacion.module').then(m => m.FacturacionModule),
      },
      {
        path: 'realizar-pago',
        loadChildren: () => import('./realizar-pago/realizar-pago.module').then(m => m.RealizarPagoModule),
      },
      {
        path: 'gestionar-pago',
        loadChildren: () => import('./gestionar-pago/gestionar-pago.module').then(m => m.GestionarPagoModule),
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagosRoutingModule {
}
