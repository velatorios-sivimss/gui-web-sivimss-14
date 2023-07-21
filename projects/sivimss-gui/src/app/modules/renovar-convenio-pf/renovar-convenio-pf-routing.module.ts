import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";

import {RenovarConvenioPfComponent} from "./components/renovar-convenios-pf/renovar-convenio-pf.component";
import { RenovarConvenioBeneficiariosComponent } from "./components/renovar-convenios-beneficiarios/renovar-convenio-beneficiarios.component";

const routes: Routes = [
  {
    path:'',
    component: RenovarConvenioPfComponent,
  },
  {
    path:'beneficiarios',
    component: RenovarConvenioBeneficiariosComponent,
  }
];

@NgModule( {
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
})

export class RenovarConvenioPfRoutingModule {}
