import { ModificarPersonaComponent } from './components/modificar-persona/modificar-persona.component';
import { DetalleBeneficiosComponent } from './components/detalle-beneficios/detalle-beneficios.component';
import { PreRegistroContratacionNuevoConvenioComponent } from './components/pre-registro-contratacion-nuevo-convenio/pre-registro-contratacion-nuevo-convenio.component'
import { SeguimientoNuevoConvenioResolver } from './services/seguimiento-nuevo-convenio.resolver'
import { SeguimientoNuevoConvenioComponent } from './components/seguimiento-nuevo-convenio/seguimiento-nuevo-convenio.component'
import { NgModule } from '@angular/core'
import { Route, RouterModule } from '@angular/router'
import { DesactivarConvenioComponent } from './components/desactivar-convenio/desactivar-convenio.component'

const routes: Route[] = [
  {
    path: '',
    component: SeguimientoNuevoConvenioComponent,
  },
  {
    path: 'pre-registro-nuevo-convenio',
    component: PreRegistroContratacionNuevoConvenioComponent,
    resolve: {
      respuesta: SeguimientoNuevoConvenioResolver,
    },
  },
  {
    path: 'desactivar-convenio',
    component: DesactivarConvenioComponent,
    resolve: {
      respuesta: SeguimientoNuevoConvenioResolver,
    },
  },
  {
    path: 'detalle-convenio',
    component: DetalleBeneficiosComponent,
    resolve: {
      respuesta: SeguimientoNuevoConvenioResolver,
    },
  },
  {
    path: 'modificar-persona',
    component: ModificarPersonaComponent,
    resolve: {
      respuesta: SeguimientoNuevoConvenioResolver,
    },
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SeguimientoNuevoConvenioResolver],
})
export class SeguimientoNuevoConvenioRoutingModule {}
