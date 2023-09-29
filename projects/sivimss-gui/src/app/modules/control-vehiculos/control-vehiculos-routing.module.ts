import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlVehiculosComponent } from './components/control-vehiculos/control-vehiculos.component';
import { ReservarSalasResolver } from "./services/control-vehiculos.resolver";

const routes: Routes = [
  {
    path: '',
    component: ControlVehiculosComponent,
    resolve: {
      respuesta: ReservarSalasResolver
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ReservarSalasResolver]
})
export class ControlVehiculosRoutingModule {
}
