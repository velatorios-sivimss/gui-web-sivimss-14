import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  OverlayPanelOpcionesModule
} from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";

import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {ConveniosPrevisionFunerariaRoutingModule} from "./convenios-prevision-funeraria-routing.module";
import {ConsultaConveniosService} from "./services/consulta-convenios.service";

import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";

import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import {PanelModule} from "primeng/panel";
import {AccordionModule} from "primeng/accordion";
import {InputTextModule} from "primeng/inputtext";
import { StepsModule } from 'primeng/steps';
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {RadioButtonModule} from "primeng/radiobutton";

import {ConsultaConveniosComponent} from "./components/convenios-prevision-funeraria/convenios-prevision-funeraria.component";
import { DetalleConvenioPrevisionFunerariaComponent } from './components/detalle-convenio-prevision-funeraria/detalle-convenio-prevision-funeraria.component';
import { AgregarConveniosPrevisionFunerariaComponent } from './components/agregar-convenios-prevision-funeraria/agregar-convenios-prevision-funeraria.component';
import { AgregarPersonaConveniosPrevisionFunerariaComponent } from './components/agregar-persona-convenios-prevision-funeraria/agregar-persona-convenios-prevision-funeraria.component';
import { AgregarBeneficiarioConveniosPrevisionFunerariaComponent } from './components/agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component';
import {UtileriaModule} from "../../shared/utileria/utileria.module";
import { PorEmpresaComponent } from './components/por-empresa/por-empresa.component';
import { PorPersonaComponent } from './components/por-persona/por-persona.component';
import {AgregarConvenioPFService} from "./services/agregar-convenio-pf.service";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "./components/detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";
import { ModificarBeneficiarioConveniosPrevisionFunerariaComponent } from './components/modificar-beneficiario-convenios-prevision-funeraria/modificar-beneficiario-convenios-prevision-funeraria.component';
import { DetalleGuardaConvenioComponent } from './components/detalle-guarda-convenio/detalle-guarda-convenio.component';
import { ConveniosPfModificarComponent } from './components/modificar-convenios-prevision-funeraria/convenios-prevision-funeraria-modificar/convenios-pf-modificar.component';
import { EstatusConvenioPrevisionFunerariaComponent } from './components/estatus-convenio-prevision-funeraria/estatus-convenio-prevision-funeraria.component';

@NgModule({
  declarations:[
    ConsultaConveniosComponent,
    DetalleConvenioPrevisionFunerariaComponent,
    AgregarConveniosPrevisionFunerariaComponent,
    AgregarPersonaConveniosPrevisionFunerariaComponent,
    AgregarBeneficiarioConveniosPrevisionFunerariaComponent,
    DetalleBeneficiarioConveniosPrevisionFunerariaComponent,
    PorEmpresaComponent,
    PorPersonaComponent,
    ModificarBeneficiarioConveniosPrevisionFunerariaComponent,
    DetalleGuardaConvenioComponent,
    ConveniosPfModificarComponent,
    EstatusConvenioPrevisionFunerariaComponent,
  ],
  imports: [
    CommonModule,
    ConveniosPrevisionFunerariaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CeldaStickyModule,
    PanelModule,
    AccordionModule,
    InputTextModule,
    StepsModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    UtileriaModule,
  ],
  providers:[
    AgregarConvenioPFService,
    ConsultaConveniosService,
    DescargaArchivosService
  ]

})

export class ConveniosPrevisionFunerariaModule {}
