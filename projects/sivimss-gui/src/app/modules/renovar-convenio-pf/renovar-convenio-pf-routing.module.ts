import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RenovarConvenioPfComponent } from "./components/renovar-convenios-pf/renovar-convenio-pf.component";
import { RenovarConvenioBeneficiariosComponent } from "./components/renovar-convenios-beneficiarios/renovar-convenio-beneficiarios.component";
import { RenovarConvenioPfResolver } from "./services/renovar-convenio-pf.resolver";

const routes: Routes = [
  {
    path: '',
    component: RenovarConvenioPfComponent,
  },
  {
    path: 'beneficiarios/:idConvenio',
    component: RenovarConvenioBeneficiariosComponent,
    resolve: {
      respuesta: RenovarConvenioPfResolver
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[
    RenovarConvenioPfResolver,
  ]
})

export class RenovarConvenioPfRoutingModule { }
