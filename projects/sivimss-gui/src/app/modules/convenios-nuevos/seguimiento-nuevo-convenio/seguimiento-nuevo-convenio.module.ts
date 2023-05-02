import { SeguimientoNuevoConvenioService } from './services/seguimiento-nuevo-convenio.service';
import { SeguimientoNuevoConvenioComponent } from './components/seguimiento-nuevo-convenio/seguimiento-nuevo-convenio.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';



import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';

import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';

import { SeguimientoNuevoConvenioRoutingModule } from './seguimiento-nuevo-convenio-routing.module';
import { OverlayPanelOpcionesModule } from '../../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from '../../../shared/table-panel/table-panel.module';
import { TituloPrincipalModule } from '../../../shared/titulo-principal/titulo-principal.module';
import { PreRegistroContratacionNuevoConvenioComponent } from './components/pre-registro-contratacion-nuevo-convenio/pre-registro-contratacion-nuevo-convenio.component';
import { DesactivarConvenioComponent } from './components/desactivar-convenio/desactivar-convenio.component';
import { DetalleBeneficiosComponent } from './components/detalle-beneficios/detalle-beneficios.component';
import { ModificarPersonaComponent } from './components/modificar-persona/modificar-persona.component';
import { DetalleBeneficiarioComponent } from './components/detalle-beneficiario/detalle-beneficiario.component';
import { ModificarBeneficiarioComponent } from './components/modificar-beneficiario/modificar-beneficiario.component';

//as
@NgModule({
  declarations: [
    SeguimientoNuevoConvenioComponent,
    PreRegistroContratacionNuevoConvenioComponent,
    DesactivarConvenioComponent,
    DetalleBeneficiosComponent,
    ModificarPersonaComponent,
    DetalleBeneficiarioComponent,
    ModificarBeneficiarioComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    SeguimientoNuevoConvenioRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule
  ],
  providers: [SeguimientoNuevoConvenioService]
})
export class SeguimientoNuevoConvenioModule { }
