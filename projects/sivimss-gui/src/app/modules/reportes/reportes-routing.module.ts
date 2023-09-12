import {Reportes} from "./components/reportes/reportes";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ReportesResolver} from "./services/reportes.resolver";

const routes: Routes = [
  {
    path: '',
    component:Reportes,
    resolve: {
      respuesta: ReportesResolver
    }
  }
]

  @NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule],
    providers:[ReportesResolver]
  })
export class ReportesRoutingModule {}
