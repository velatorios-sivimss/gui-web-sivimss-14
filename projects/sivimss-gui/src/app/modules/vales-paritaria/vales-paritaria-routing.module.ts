import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValesParitariaComponent } from './components/vales-paritaria/vales-paritaria.component';
import { SolicitarValeParitariaComponent } from "./components/solicitar-vale-paritaria/solicitar-vale-paritaria.component";
import { ModificarCreditoComponent } from './components/modificar-credito/modificar-credito.component';
const routes: Routes = [
  {
    path: '', 
    component: ValesParitariaComponent,
  },
  {
    path: 'solicitar-vale',
    component: SolicitarValeParitariaComponent,
  },
  {
    path: 'modificar-credito',
    component: ModificarCreditoComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class RolesRoutingModule {
}
