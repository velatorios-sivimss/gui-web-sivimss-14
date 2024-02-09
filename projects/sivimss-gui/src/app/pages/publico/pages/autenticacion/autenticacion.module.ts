import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticacionRoutingModule } from './autenticacion-routing.module';
import { AutenticacionComponent } from './autenticacion.component';
import { ModalRestablecerContraseniaComponent } from './components/modal-restablecer-contrasenia/modal-restablecer-contrasenia.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { ActualizarContraseniaComponent } from './components/actualizar-contrasenia/actualizar-contrasenia.component';
import { RestablecerContraseniaComponent } from './components/restablecer-contrasenia/restablecer-contrasenia.component';
import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';

@NgModule({
  declarations: [
    AutenticacionComponent,
    ModalRestablecerContraseniaComponent,
    ActualizarContraseniaComponent,
    InicioSesionComponent,
    RestablecerContraseniaComponent,
  ],
  imports: [
    CommonModule,
    AutenticacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  providers: [DialogService, //AutenticacionContratanteService
],
})
export class AutenticacionModule { }
