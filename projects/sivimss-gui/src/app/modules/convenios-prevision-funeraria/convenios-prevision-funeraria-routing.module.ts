import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {ConsultaConveniosComponent} from "./components/convenios-prevision-funeraria/convenios-prevision-funeraria.component";
import {
  AgregarConveniosPrevisionFunerariaComponent
} from "./components/agregar-convenios-prevision-funeraria/agregar-convenios-prevision-funeraria.component";
import {ConsultaConveniosResolver} from "./services/consulta-convenios.resolver";
import {
  AgregarPersonaConveniosPrevisionFunerariaComponent
} from "./components/agregar-persona-convenios-prevision-funeraria/agregar-persona-convenios-prevision-funeraria.component";
import {AgregarConvenioPfResolver} from "./services/agregar-convenio-pf.resolver";
import {
  ConveniosPfModificarComponent
} from "./components/modificar-convenios-prevision-funeraria/convenios-prevision-funeraria-modificar/convenios-pf-modificar.component";

const routes: Routes = [
  {
    path: '',
    component: ConsultaConveniosComponent
  },
  {
    path: 'ingresar-nuevo-convenio',
    component: AgregarConveniosPrevisionFunerariaComponent,
    resolve: {
      respuesta: AgregarConvenioPfResolver
    },
  },
  {
    path: 'ingresar-nuevo-convenio/agregar-persona',
    component: AgregarPersonaConveniosPrevisionFunerariaComponent,
    resolve: {
      respuesta: AgregarConvenioPfResolver
    }
  },
  {
    path: 'modificar-nuevo-convenio/agregar-persona',
    component: AgregarPersonaConveniosPrevisionFunerariaComponent,
    resolve: {
      respuesta: AgregarConvenioPfResolver
    }
  },
  {
    path: 'modificar-nuevo-convenio',
    component: ConveniosPfModificarComponent,
    resolve: {
      respuesta: AgregarConvenioPfResolver
    }
  }

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  providers:[
    AgregarConvenioPfResolver,
    ConsultaConveniosResolver
  ]
})

export class ConveniosPrevisionFunerariaRoutingModule {}
