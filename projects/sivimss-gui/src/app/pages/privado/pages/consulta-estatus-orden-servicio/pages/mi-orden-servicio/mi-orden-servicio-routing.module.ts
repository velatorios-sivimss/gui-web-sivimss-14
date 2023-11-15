import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiOrdenServicioComponent } from './mi-orden-servicio.component';

const routes: Routes = [{ path: '', component: MiOrdenServicioComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiOrdenServicioRoutingModule { }
