import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistroRoutingModule } from './registro-routing.module';
import { RegistroComponent } from './registro.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { ContratantesService } from 'projects/sivimss-gui/src/app/modules/contratantes/services/contratantes.service';
import { UtileriaModule } from 'projects/sivimss-gui/src/app/shared/utileria/utileria.module';
import { UsuarioService } from 'projects/sivimss-gui/src/app/modules/usuarios/services/usuario.service';
import { RegistroService } from './services/registro.service';

@NgModule({
  declarations: [RegistroComponent],
  imports: [
    CommonModule,
    RegistroRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TituloPrincipalModule,
    CalendarModule,
    DropdownModule,
    UtileriaModule,
  ],
  providers:[
    RegistroService,
    UsuarioService,
  ],
})
export class RegistroModule {}
