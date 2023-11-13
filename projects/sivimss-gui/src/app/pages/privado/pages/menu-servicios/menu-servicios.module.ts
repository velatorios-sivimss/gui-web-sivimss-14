import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuServiciosRoutingModule } from './menu-servicios-routing.module';
import { MenuServiciosComponent } from './menu-servicios.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';

@NgModule({
  declarations: [MenuServiciosComponent],
  imports: [CommonModule, MenuServiciosRoutingModule, TituloPrincipalModule],
})
export class MenuServiciosModule {}
