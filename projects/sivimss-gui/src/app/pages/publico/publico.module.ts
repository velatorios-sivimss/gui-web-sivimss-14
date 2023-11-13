import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicoRoutingModule } from './publico-routing.module';
import { PublicoComponent } from './publico.component';


@NgModule({
  declarations: [
    PublicoComponent
  ],
  imports: [
    CommonModule,
    PublicoRoutingModule,
  ]
})
export class PublicoModule { }
