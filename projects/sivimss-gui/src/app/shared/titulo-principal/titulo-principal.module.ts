import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TituloPrincipalComponent } from './components/titulo-principal/titulo-principal.component';



@NgModule({
  declarations: [
    TituloPrincipalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TituloPrincipalComponent
  ]
})
export class TituloPrincipalModule { }
