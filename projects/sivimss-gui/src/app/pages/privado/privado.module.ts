import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivadoRoutingModule } from './privado-routing.module';
import { PrivadoComponent } from './privado.component';
import { SubheaderPrivadoComponent } from './components/subheader-privado/subheader-privado.component';


@NgModule({
  declarations: [
    PrivadoComponent,
    SubheaderPrivadoComponent
  ],
  imports: [
    CommonModule,
    PrivadoRoutingModule
  ]
})
export class PrivadoModule { }
