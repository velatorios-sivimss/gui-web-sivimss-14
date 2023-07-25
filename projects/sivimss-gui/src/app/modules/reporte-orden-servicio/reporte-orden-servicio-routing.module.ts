import {ReporteOrdenServicioComponent} from "./components/reporte-orden-servicio/reporte-orden-servicio.component";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";

const routes: Routes = [
  {
    path: '',
    component:ReporteOrdenServicioComponent
  }
]

  @NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule],
    providers:[]
  })
export class ReporteOrdenServicioRoutingModule{}
