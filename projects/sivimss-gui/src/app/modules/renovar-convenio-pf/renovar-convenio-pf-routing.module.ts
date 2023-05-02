import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";

import {RenovarConvenioPfComponent} from "./components/renovar-convenios-pf/renovar-convenio-pf.component";

const routes: Routes = [
  {
    path:'',
    component: RenovarConvenioPfComponent,
  }
];

@NgModule( {
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
})

export class RenovarConvenioPfRoutingModule {}
