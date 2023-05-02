import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InicioComponent} from './components/inicio/inicio.component';
import {InicioRoutingModule} from './inicio-routing.module';
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";


@NgModule({
  declarations: [
    InicioComponent
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    TituloPrincipalModule
  ]
})
export class InicioModule {
}
