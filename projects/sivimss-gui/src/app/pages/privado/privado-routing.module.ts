import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivadoComponent } from './privado.component';

const routes: Routes = [
  {
    path: '',
    component: PrivadoComponent,
    children: [
      {
        path: '',
        redirectTo: 'consultar-mis-servicios-en-linea',
        pathMatch: 'full',
      },
      {
        path: 'consultar-mis-servicios-en-linea',
        loadChildren: () =>
          import('./pages/menu-servicios/menu-servicios.module').then(
            (m) => m.MenuServiciosModule
          ),
      },
      {
        path: 'consultar-mi-convenio-de-prevision-funeraria',
        loadChildren: () =>
          import(
            './pages/consulta-convenio-prevision-funeraria/consulta-convenio-prevision-funeraria.module'
          ).then((m) => m.ConsultaConvenioPrevisionFunerariaModule),
      },
      {
        path: 'consultar-plan-de-servicios-funerarios-pago-anticipado',
        loadChildren: () =>
          import(
            './pages/consulta-plan-servicios-funerarios-pago-anticipado/consulta-plan-servicios-funerarios-pago-anticipado.module'
          ).then((m) => m.ConsultaPlanServiciosFunerariosPagoAnticipadoModule),
      },
      {
        path: 'consultar-el-estatus-de-mi-orden-de-servicio',
        loadChildren: () =>
          import(
            './pages/consulta-estatus-orden-servicio/consulta-estatus-orden-servicio.module'
          ).then((m) => m.ConsultaEstatusOrdenServicioModule),
      },
      {
        path: 'contratar-convenio-de-prevision-funeraria',
        loadChildren: () =>
          import(
            './pages/mapa-contratar-convenio-prevision-funeraria/mapa-contratar-convenio-prevision-funeraria.module'
          ).then((m) => m.MapaContratarConvenioPrevisionFunerariaModule),
      },
      {
        path: 'contratar-plan-de-servicios-funerarios-pago-anticipado',
        loadChildren: () =>
          import(
            './pages/mapa-contratar-plan-servicios-funerarios-pago-anticipado/mapa-contratar-plan-servicios-funerarios-pago-anticipado.module'
          ).then((m) => m.MapaContratarPlanServiciosFunerariosPagoAnticipadoModule),
      },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivadoRoutingModule {}
