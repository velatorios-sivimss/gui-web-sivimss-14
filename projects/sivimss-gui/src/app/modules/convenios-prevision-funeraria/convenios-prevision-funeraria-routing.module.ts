import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {ConsultaConveniosComponent} from "./components/convenios-prevision-funeraria/convenios-prevision-funeraria.component";
import {
  AgregarConveniosPrevisionFunerariaComponent
} from "./components/agregar-convenios-prevision-funeraria/agregar-convenios-prevision-funeraria.component";

const routes: Routes = [
  {
    path: '',
    component: ConsultaConveniosComponent
  },
  {
    path: 'ingresar-nuevo-convenio',
    component: AgregarConveniosPrevisionFunerariaComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class ConveniosPrevisionFunerariaRoutingModule {}
