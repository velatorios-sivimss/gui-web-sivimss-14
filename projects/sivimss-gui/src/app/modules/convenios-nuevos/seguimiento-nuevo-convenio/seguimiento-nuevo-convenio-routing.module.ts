import {ModificarPersonaComponent} from './components/modificar-persona/modificar-persona.component';
import {DetalleBeneficiosComponent} from './components/detalle-beneficios/detalle-beneficios.component';
import {
  PreRegistroContratacionNuevoConvenioComponent
} from './components/pre-registro-contratacion-nuevo-convenio/pre-registro-contratacion-nuevo-convenio.component'
import {SeguimientoNuevoConvenioResolver} from './services/seguimiento-nuevo-convenio.resolver'
import {
  SeguimientoNuevoConvenioComponent
} from './components/seguimiento-nuevo-convenio/seguimiento-nuevo-convenio.component'
import {NgModule} from '@angular/core'
import {Route, RouterModule} from '@angular/router'
import {DesactivarConvenioComponent} from './components/desactivar-convenio/desactivar-convenio.component'
import {DesactivarNuevoConvenioResolver} from "./services/desactivar-nuevo-convenio.resolver";
import {PreregistroConvenioResolver} from "./services/preregistro-convenio.resolver";

const routes: Route[] = [
  {
    path: '',
    component: SeguimientoNuevoConvenioComponent,
    resolve: {
      respuesta: SeguimientoNuevoConvenioResolver,
    },
  },
  {
    path: 'pre-registro-nuevo-convenio/:idConvenio',
    component: PreRegistroContratacionNuevoConvenioComponent,
    resolve: {
      respuesta: PreregistroConvenioResolver,
    },
  },
  {
    path: 'desactivar-convenio/:idConvenio',
    component: DesactivarConvenioComponent,
    resolve: {
      respuesta: DesactivarNuevoConvenioResolver,
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
  providers: [SeguimientoNuevoConvenioResolver, DesactivarNuevoConvenioResolver,
    PreregistroConvenioResolver],
})
export class SeguimientoNuevoConvenioRoutingModule {
}
