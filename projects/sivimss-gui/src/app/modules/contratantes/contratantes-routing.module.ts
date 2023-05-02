import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";
import {ContratantesComponent} from "./components/contratantes/contratantes.component";

const routes: Routes = [
  {
    path:'',
    component:ContratantesComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class ContratantesRoutingModule{}
