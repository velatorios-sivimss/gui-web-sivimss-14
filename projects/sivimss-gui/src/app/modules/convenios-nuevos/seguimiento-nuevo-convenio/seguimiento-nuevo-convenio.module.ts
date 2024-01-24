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
import {BtnRegresarModule} from "../../../shared/btn-regresar/btn-regresar.module";
import {UtileriaModule} from "../../../shared/utileria/utileria.module";
import {CeldaStickyModule} from "../../../shared/celda-sticky/celda-sticky.module";
import { ConvenioHeaderComponent } from './shared/convenio-header/convenio-header.component';
import { DatosPersonaComponent } from './shared/datos-persona/datos-persona.component';
import { DatosBeneficiarioComponent } from './shared/datos-beneficiario/datos-beneficiario.component';
import { DocumentacionBeneficiarioComponent } from './shared/documentacion-beneficiario/documentacion-beneficiario.component';
import { DatosEmpresaComponent } from './shared/datos-empresa/datos-empresa.component';
import { ResumenPersonaComponent } from './shared/resumen-persona/resumen-persona.component';
import { ResumenBeneficiarioComponent } from './shared/resumen-beneficiario/resumen-beneficiario.component';
import { ResumenDocumentacionBeneficiarioComponent } from './shared/resumen-documentacion-beneficiario/resumen-documentacion-beneficiario.component';
import { ResumenEmpresaComponent } from './shared/resumen-empresa/resumen-empresa.component';
import { DatosTitularBeneficiarioComponent } from './shared/datos-titular-beneficiario/datos-titular-beneficiario.component';
import { ResumenTitularBeneficiarioComponent } from './shared/resumen-titular-beneficiario/resumen-titular-beneficiario.component';
import {RadioButtonModule} from "primeng/radiobutton";

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
    ConvenioHeaderComponent,
    DocumentacionBeneficiarioComponent,
    DatosEmpresaComponent,
    ResumenPersonaComponent,
    ResumenBeneficiarioComponent,
    ResumenDocumentacionBeneficiarioComponent,
    ResumenEmpresaComponent,
    DatosTitularBeneficiarioComponent,
    ResumenTitularBeneficiarioComponent,
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
        AccordionModule,
        BtnRegresarModule,
        UtileriaModule,
        CeldaStickyModule,
        DatosPersonaComponent,
        DatosBeneficiarioComponent,
        RadioButtonModule
    ],
  providers: [SeguimientoNuevoConvenioService]
})
export class SeguimientoNuevoConvenioModule { }
