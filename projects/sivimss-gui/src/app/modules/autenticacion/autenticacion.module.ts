import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogService } from "primeng/dynamicdialog";
import { AutenticacionRoutingModule } from './autenticacion-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { InicioAutenticacionComponent } from './components/inicio-autenticacion/inicio-autenticacion.component';
import { ActualizarContraseniaComponent } from 'projects/sivimss-gui/src/app/modules/autenticacion/components/actualizar-contrasenia/actualizar-contrasenia.component';
import { DialogModule } from "primeng/dialog";
import { UtileriaModule } from "projects/sivimss-gui/src/app/shared/utileria/utileria.module";
import { ModalRestablecerContraseniaComponent } from './components/modal-restablecer-contrasenia/modal-restablecer-contrasenia.component';

@NgModule({
  declarations: [
    InicioSesionComponent,
    InicioAutenticacionComponent,
    ActualizarContraseniaComponent,
    ModalRestablecerContraseniaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    AutenticacionRoutingModule,
    UtileriaModule,
    DialogModule
  ],
  providers: [
    DialogService
  ]
})
export class AutenticacionModule {
}
