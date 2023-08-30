import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CancelarOrdenServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/cancelar-orden-servicio/cancelar-orden-servicio.component';
import { GenerarOrdenServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/generar-orden-servicio/generar-orden-servicio.component';
import { ModificarDatosContratanteComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modificar-datos-contratante/modificar-datos-contratante.component';
import { ModificarDatosFinadoComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modificar-datos-finado/modificar-datos-finado.component';
import { ModificarInformacionServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modificar-informacion-servicio/modificar-informacion-servicio.component';
import { OrdenesServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/ordenes-servicio/ordenes-servicio.component';
import { ResumenOrdenComplementariaComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/resumen-orden-complementaria/resumen-orden-complementaria.component';
import { VerOrdenComplementariaComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/ver-orden-complementaria/ver-orden-complementaria.component';
import { VerOrdenServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/ver-orden-de-servicio/ver-orden-servicio.component';
import { GenerarOrdenServicioResolver } from './services/generar-orden-servicio.resolver';
import { ConsultarOrdenServicioResolver } from './services/consultar-orden-servicio.resolver';
import { ActualizarOrdenServicioComponent } from './components/actualizar-orden-servicio/actualizar-orden-servicio.component';
import { ActualizarOrdenServicioResolver } from './services/actualizar-orden-servicio.resolver';
import {OrdenesServicioSFComponent} from "./components/ods-plan-servicios-funerarios/ordenes-servicio/ordenes-servicio.component";
import {
  GenerarOrdenServicioSFComponent
} from "./components/ods-plan-servicios-funerarios/generar-orden-servicio/generar-orden-servicio.component";
import {
  ActualizarOrdenServicioSFComponent
} from "./components/ods-plan-servicios-funerarios/actualizar-orden-servicio/actualizar-orden-servicio.component";


const routes: Routes = [
  {
    path: '',
    component: OrdenesServicioComponent,
    resolve: {
      respuesta: ConsultarOrdenServicioResolver,
    },
  },
  {
    path: 'ods-plan-sf',
    component: OrdenesServicioSFComponent,
    resolve: {
      respuesta: ConsultarOrdenServicioResolver,
    },
  },
  {
    path: 'ods-plan-sf/generar-ods-sf',
    component: GenerarOrdenServicioSFComponent,
    resolve: {
      respuesta: GenerarOrdenServicioResolver,
    },
  },
  {
    path: 'generar-orden-de-servicio',
    component: GenerarOrdenServicioComponent,
    resolve: {
      respuesta: GenerarOrdenServicioResolver,
    },
  },
  {
    path: 'modificar-orden-de-servicio',
    component: ActualizarOrdenServicioComponent,
    resolve: {
      respuesta: ActualizarOrdenServicioResolver,
    },
  },
  {
    path: 'ods-plan-sf/modificar-ods-sf',
    component: ActualizarOrdenServicioSFComponent,
    resolve: {
      respuesta: ActualizarOrdenServicioResolver,
    },
  },
  // {
  //   path: 'modificar-orden-de-servicio/:idODS/:idEstatus',
  //   component: ActualizarOrdenServicioComponent,
  //   resolve: {
  //     respuesta: ActualizarOrdenServicioResolver,
  //   },
  // },
  {
    path: 'cancelar-orden-de-servicio',
    component: CancelarOrdenServicioComponent,
  },
  {
    path: 'ver-orden-de-servicio',
    component: VerOrdenServicioComponent,
  },
  {
    path: 'resumen-orden-complementaria',
    component: ResumenOrdenComplementariaComponent,
  },
  {
    path: 'ver-orden-complementaria',
    component: VerOrdenComplementariaComponent,
  },
  {
    path: 'modificar-datos-contratante',
    component: ModificarDatosContratanteComponent,
  },
  {
    path: 'modificar-datos-finado',
    component: ModificarDatosFinadoComponent,
  },
  {
    path: 'modificar-informacion-servicio',
    component: ModificarInformacionServicioComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GenerarOrdenServicioResolver,
    ConsultarOrdenServicioResolver,
    ActualizarOrdenServicioResolver,
  ],
})
export class OrdenesServicioRoutingModule {}
