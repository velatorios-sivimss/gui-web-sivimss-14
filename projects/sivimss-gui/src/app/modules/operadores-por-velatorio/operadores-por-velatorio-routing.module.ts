import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {
  OperadoresPorVelatorioComponent
} from "./components/operadores-por-velatorio/operadores-por-velatorio.component";

const routes: Routes = [{
  path:'',
  component: OperadoresPorVelatorioComponent
}]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class OperadoresPorVelatorioRoutingModule{

}
