import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistroPersonaGrupoRoutingModule } from './registro-persona-grupo-routing.module';
import { RegistroPersonaGrupoComponent } from './registro-persona-grupo.component';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { BtnRegresarModule } from 'projects/sivimss-gui/src/app/shared/btn-regresar/btn-regresar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OverlayPanelOpcionesModule } from 'projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [RegistroPersonaGrupoComponent],
  imports: [
    CommonModule,
    RegistroPersonaGrupoRoutingModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    TituloPrincipalModule,
    BtnRegresarModule,
    TableModule,
    CheckboxModule,
    RadioButtonModule,
    OverlayPanelOpcionesModule,
    OverlayPanelModule,
    DialogModule,
  ],
})
export class RegistroPersonaGrupoModule {}
