import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {
  RegistroOtorgamientoServiciosComponent
} from "./components/registro-otorgamiento-servicios/registro-otorgamiento-servicios.component";

const routes: Routes = [{
  path:'',
  component: RegistroOtorgamientoServiciosComponent
}]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class RegistroOtorgamientoServiciosRoutingModule{

}
