import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealizarBalanceCajaComponent } from './realizar-balance-caja.component';

const routes: Routes = [{ path: '', component: RealizarBalanceCajaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealizarBalanceCajaRoutingModule { }
