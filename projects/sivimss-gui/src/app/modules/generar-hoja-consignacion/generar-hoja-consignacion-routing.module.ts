import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { GenerarHojaConsignacionComponent } from './components/generar-hoja-consignacion/generar-hoja-consignacion.component';
import { GenerarHojaConsignacionResolver } from './services/generar-hoja-consignacion.resolver';
import { AgregarGenerarHojaConsignacionComponent } from './components/agregar-generar-hoja-consignacion/agregar-generar-hoja-consignacion.component';
import { GenerarHojaConsignacionDetalleResolver } from './services/generar-hoja-consignacion-detalle.resolver';

const routes: Route[] = [
  {
    path: '',
    component: GenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    }
  },
  {
    path: 'agregar-hoja',
    component: AgregarGenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    },
  },
  {
    path: 'detalle-de-hoja/:idHojaConsignacion',
    component: AgregarGenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionDetalleResolver
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GenerarHojaConsignacionResolver,
    GenerarHojaConsignacionDetalleResolver
  ]
})
export class PromotoresRoutingModule {
}
