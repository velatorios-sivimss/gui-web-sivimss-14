import {ReporteOrdenServicioComponent} from "./components/reporte-orden-servicio/reporte-orden-servicio.component";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ReporteOrdenServicioResolver} from "./services/reporte-orden-servicio.resolver";

const routes: Routes = [
  {
    path: '',
    component:ReporteOrdenServicioComponent,
    resolve: {
      respuesta: ReporteOrdenServicioResolver
    }
  }
]

  @NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule],
    providers:[ReporteOrdenServicioResolver]
  })
export class ReporteOrdenServicioRoutingModule{}
