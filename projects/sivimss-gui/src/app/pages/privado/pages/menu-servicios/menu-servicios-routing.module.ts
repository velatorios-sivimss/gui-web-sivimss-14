import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuServiciosComponent } from './menu-servicios.component';

const routes: Routes = [{ path: '', component: MenuServiciosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuServiciosRoutingModule { }
