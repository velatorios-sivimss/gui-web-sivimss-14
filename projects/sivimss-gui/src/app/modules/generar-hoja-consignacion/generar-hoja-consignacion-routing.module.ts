import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { GenerarHojaConsignacionComponent } from './components/generar-hoja-consignacion/generar-hoja-consignacion.component';
import { GenerarHojaConsignacionResolver } from './services/generar-hoja-consignacion.resolver';
import { AgregarGenerarHojaConsignacionComponent } from './components/agregar-generar-hoja-consignacion/agregar-generar-hoja-consignacion.component';

const routes: Route[] = [
  {
    path: '',
    component: GenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    }
  },
  {
    path: 'agregar-actividades',
    component: AgregarGenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    },
  },
  {
    path: 'detalle-de-actividades/:id',
    component: AgregarGenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    },
  },
  {
    path: 'modificar-actividades/:id',
    component: AgregarGenerarHojaConsignacionComponent,
    resolve: {
      respuesta: GenerarHojaConsignacionResolver
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GenerarHojaConsignacionResolver
  ]
})
export class PromotoresRoutingModule {
}
