import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {InputSwitchModule} from 'primeng/inputswitch';
import {OverlayPanelModule} from 'primeng/overlaypanel';

import {TituloPrincipalModule} from '../../shared/titulo-principal/titulo-principal.module';
import {TablePanelModule} from '../../shared/table-panel/table-panel.module';
import {OverlayPanelOpcionesModule} from '../../shared/overlay-panel-opciones/overlay-panel-opciones.module';
import {DialogModule} from 'primeng/dialog';
import {StepsModule} from 'primeng/steps';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CheckboxModule} from "primeng/checkbox";

import {CalendarModule} from 'primeng/calendar';
import {AccordionModule} from 'primeng/accordion';
import {SolicitudesPagoComponent} from './components/solicitudes-pago/solicitudes-pago.component';
import {SolicitudesPagoService} from './services/solicitudes-pago.service';
import {SolicitudesPagoRoutingModule} from './solicitudes-pago.routing.module';
import {UtileriaModule} from '../../shared/utileria/utileria.module';
import {ValidaRolModule} from '../../shared/valida-rol/valida-rol.module';
import {
  SolicitarSolicitudPagoComponent
} from './components/solicitar-solicitud-pago/solicitar-solicitud-pago.component';
import {CancelarSolicitudPagoComponent} from "./components/cancelar-solicitud-pago/cancelar-solicitud-pago.component";
import {RechazarSolicitudPagoComponent} from "./components/rechazar-solicitud-pago/rechazar-solicitud-pago.component";
import {VerDetalleSolicitudPagoComponent} from './components/ver-detalle-solicitud/ver-detalle-solicitud.component';
import {CeldaStickyModule} from "../../shared/celda-sticky/celda-sticky.module";
import {AceptarSolicitudPagoComponent} from "./components/aceptar-solicitud-pago/aceptar-solicitud-pago.component";
import {RegexFolioFiscalDirective} from "./directives/regex-folio-fiscal.directive";
import {PanelModule} from "primeng/panel";
import {RadioButtonModule} from "primeng/radiobutton";
import {SinCaracteresEspecialesDirective} from "./directives/sin-caracteres-especiales.directive";

@NgModule({
  declarations: [
    SolicitudesPagoComponent,
    SolicitarSolicitudPagoComponent,
    CancelarSolicitudPagoComponent,
    RechazarSolicitudPagoComponent,
    VerDetalleSolicitudPagoComponent,
    AceptarSolicitudPagoComponent,
    RegexFolioFiscalDirective,
    SinCaracteresEspecialesDirective,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    InputSwitchModule,
    SolicitudesPagoRoutingModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    ReactiveFormsModule,
    TableModule,
    TablePanelModule,
    TituloPrincipalModule,
    StepsModule,
    AccordionModule,
    AutoCompleteModule,
    ValidaRolModule,
    UtileriaModule,
    CheckboxModule,
    CeldaStickyModule,
    PanelModule,
    RadioButtonModule
  ],
  providers: [SolicitudesPagoService]
})
export class SolicitudesPagoModule {
}
