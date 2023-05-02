import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {ServiciosComponent} from "./components/servicios/servicios.component";

const routes: Routes = [{
  path:'',
  component: ServiciosComponent
}]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class ServiciosRoutingModule{

}
