import {NgModule} from '@angular/core'
import {Route, RouterModule} from '@angular/router'
import {
  ProgramarMantenimientoVehicularComponent
} from './components/programar-mantenimiento-vehicular/programar-mantenimiento-vehicular.component'
import {MantenimientoVehicularResolver} from './services/mantenimiento-vehicular.resolver'
import {
  NuevaVerificacionComponent
} from './components/nueva-verificacion/nueva-verificacion/nueva-verificacion.component'
import {
  DetalleNuevaVerificacionComponent
} from './components/nueva-verificacion/detalle-nueva-verificacion/detalle-nueva-verificacion.component'
import {
  SolicitudMantenimientoComponent
} from './components/solicitud-mantenimiento/solicitud-mantenimiento/solicitud-mantenimiento.component'
import {
  DetalleSolicitudMantenimientoComponent
} from './components/solicitud-mantenimiento/detalle-solicitud-mantenimiento/detalle-solicitud-mantenimiento.component'
import {
  RegistroMantenimientoComponent
} from './components/registro-mantenimiento/registro-mantenimiento/registro-mantenimiento.component'
import {
  DetalleRegistroMantenimientoComponent
} from './components/registro-mantenimiento/detalle-registro-mantenimiento/detalle-registro-mantenimiento.component'
import {
  MantenimientoPredictivoComponent
} from './components/mantenimiento-predictivo/mantenimiento-predictivo.component'
import {ReporteEncargadoComponent} from './components/reporte-encargado/reporte-encargado.component'
import {ModificarArticulosComponent} from '../articulos/components/modificar-articulos/modificar-articulos.component'

const routes: Route[] = [
  {
    path: '',
    component: ProgramarMantenimientoVehicularComponent,
    resolve: {
      respuesta: MantenimientoVehicularResolver
    }
  },
  {
    path: 'nueva-verificacion',
    component: NuevaVerificacionComponent,
  },
  {
    path: 'detalle-verificacion',
    component: DetalleNuevaVerificacionComponent,
  },
  {
    path: 'solicitud-mantenimiento',
    component: SolicitudMantenimientoComponent,
  },
  {
    path: 'detalle-solicitud-mantenimiento',
    component: DetalleSolicitudMantenimientoComponent,
  },
  {
    path: 'registro-mantenimiento',
    component: RegistroMantenimientoComponent,
  },
  {
    path: 'detalle-registro-mantenimiento',
    component: DetalleRegistroMantenimientoComponent,
  },
  {
    path: 'mantenimiento-predictivo',
    component: MantenimientoPredictivoComponent,
  },
  {
    path: 'reporte-encargado',
    component: ReporteEncargadoComponent,
  },
  {
    path: 'modificar',
    component: ModificarArticulosComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MantenimientoVehicularResolver],
})
export class MantenimientoVehicularRoutingModule {
}
