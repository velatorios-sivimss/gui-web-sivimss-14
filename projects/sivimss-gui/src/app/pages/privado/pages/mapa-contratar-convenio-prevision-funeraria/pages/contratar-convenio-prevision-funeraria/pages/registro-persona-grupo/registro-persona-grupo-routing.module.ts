import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroPersonaGrupoComponent } from './registro-persona-grupo.component';

const routes: Routes = [{ path: '', component: RegistroPersonaGrupoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroPersonaGrupoRoutingModule { }
