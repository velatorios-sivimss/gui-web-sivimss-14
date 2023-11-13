import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiOrdenServicioRoutingModule } from './mi-orden-servicio-routing.module';
import { MiOrdenServicioComponent } from './mi-orden-servicio.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    MiOrdenServicioComponent
  ],
  imports: [
    CommonModule,
    MiOrdenServicioRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule
  ]
})
export class MiOrdenServicioModule { }
