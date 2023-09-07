import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { GenerarFormatoActividadesComponent } from './components/generar-formato-actividades/generar-formato-actividades.component';
import { GenerarFormatoActividadesResolver } from './services/generar-formato-actividades.resolver';
import { AgregarGenerarFormatoActividadesComponent } from './components/agregar-generar-formato-actividades/agregar-generar-formato-actividades.component';
import { VerDetalleGenerarFormatoActividadesComponent } from './components/ver-detalle-generar-formato-actividades/ver-detalle-generar-formato-actividades.component';

const routes: Route[] = [
  {
    path: '',
    component: GenerarFormatoActividadesComponent,
    resolve: {
      respuesta: GenerarFormatoActividadesResolver
    }
  },
  {
    path: 'agregar-actividades',
    component: AgregarGenerarFormatoActividadesComponent,
    resolve: {
      respuesta: GenerarFormatoActividadesResolver
    },
  },
  {
    path: 'detalle-de-actividades/:id',
    component: VerDetalleGenerarFormatoActividadesComponent,
    resolve: {
      respuesta: GenerarFormatoActividadesResolver
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GenerarFormatoActividadesResolver
  ]
})
export class PromotoresRoutingModule {
}
