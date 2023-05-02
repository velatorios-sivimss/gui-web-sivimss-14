import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReservarSalasComponent} from './components/reservar-salas/reservar-salas.component';
import {ListadoSalasComponent} from './components/listado-salas/listado-salas.component';
import {CalendarioSalasComponent} from './components/calendario-salas/calendario-salas.component';
import {ReservarSalasResolver} from "./services/reservar-salas.resolver";

const routes: Routes = [
  {
    path: '',
    component: ReservarSalasComponent,
    children: [
      {
        path: 'calendario',
        component: CalendarioSalasComponent,
        outlet: 'salas',
        resolve: {
          respuesta: ReservarSalasResolver
        }
      },
      {
        path: 'salas',
        component: ListadoSalasComponent,
        outlet: 'salas',
        resolve: {
          respuesta: ReservarSalasResolver
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ReservarSalasResolver]
})
export class ReservarSalasRoutingModule {
}
