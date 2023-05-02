import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgregarPaquetesComponent } from './components/agregar-paquetes/agregar-paquetes.component';
import { ActualizarPaquetesComponent } from './components/modificar-paquetes/actualizar-paquetes.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { PaquetesResolver } from './services/paquetes.resolver';

const routes: Routes = [
  {
    path: '', component: PaquetesComponent,
  },
  {
    path: 'agregar-paquete',
    component: AgregarPaquetesComponent,
    resolve: {
      respuesta: PaquetesResolver
    }
  },
  {
    path: 'modificar-paquete/:id',
    component: ActualizarPaquetesComponent,
    resolve: {
      respuesta: PaquetesResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    PaquetesResolver
]
})
export class PaquetesRoutingModule {
}
