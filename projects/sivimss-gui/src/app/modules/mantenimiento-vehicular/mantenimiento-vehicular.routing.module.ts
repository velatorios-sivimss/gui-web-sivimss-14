import {NgModule} from '@angular/core'
import {Route, RouterModule} from '@angular/router'
import {
  ProgramarMantenimientoVehicularComponent
} from './components/programar-mantenimiento-vehicular/programar-mantenimiento-vehicular.component'
import {MantenimientoVehicularResolver} from './services/mantenimiento-vehicular.resolver'
import {
  MantenimientoPredictivoComponent
} from './components/mantenimiento-predictivo/mantenimiento-predictivo.component'
import {ReporteEncargadoComponent} from './components/reporte-encargado/reporte-encargado.component'
import {DetalleMantenimientoComponent} from "./components/detalle-mantenimiento/detalle-mantenimiento.component";
import {MantenimientoVehicularDetalleResolver} from "./services/mantenimiento-vehicular-detalle.resolver";
import {ReporteEncargadoResolver} from "./services/reporte-encargado.resolver";
import {MantenimientoPredictivoResolver} from "./services/mantenimiento-predictivo.resolver";

const routes: Route[] = [
  {
    path: '',
    component: ProgramarMantenimientoVehicularComponent,
    resolve: {
      respuesta: MantenimientoVehicularResolver
    }
  },
  {
    path: 'mantenimiento-predictivo',
    component: MantenimientoPredictivoComponent,
    resolve: {
      respuesta: MantenimientoPredictivoResolver
    }
  },
  {
    path: 'reporte-encargado',
    component: ReporteEncargadoComponent,
    resolve: {
      respuesta: ReporteEncargadoResolver
    }
  },
  {
    path: 'detalle-mantenimiento/:idMttoVehicular',
    component: DetalleMantenimientoComponent,
    resolve: {
      respuesta: MantenimientoVehicularDetalleResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MantenimientoVehicularResolver, MantenimientoVehicularDetalleResolver,
    ReporteEncargadoResolver, MantenimientoPredictivoResolver],
})
export class MantenimientoVehicularRoutingModule {
}
