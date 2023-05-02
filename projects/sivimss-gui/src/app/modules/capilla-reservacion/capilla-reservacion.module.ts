import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { FullCalendarModule } from "@fullcalendar/angular";

import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {SelectButtonModule} from "primeng/selectbutton";

import {OverlayPanelOpcionesModule} from "../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TituloPrincipalModule} from "../../shared/titulo-principal/titulo-principal.module";
import {TablePanelModule} from "../../shared/table-panel/table-panel.module";

import {CapillaReservacionComponent} from "./components/capilla-reservacion/capilla-reservacion.component";
import {CapillaReservacionRoutingModule} from "./capilla-reservacion-routing.module";
import {CapillaReservacionService} from "./services/capilla-reservacion.service";
import {CalendarModule} from "primeng/calendar";
import { RegistrarEntradaComponent } from './components/registrar-entrada/registrar-entrada.component';
import { RegistrarSalidaComponent } from './components/registrar-salida/registrar-salida.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { DetalleActividadDiaComponent } from './components/detalle-actividad-dia/detalle-actividad-dia.component';
import {AccordionModule} from "primeng/accordion";

@NgModule({
  declarations:[CapillaReservacionComponent, RegistrarEntradaComponent, RegistrarSalidaComponent, CalendarioComponent, DetalleActividadDiaComponent],
  imports: [
    CommonModule,
    CapillaReservacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DynamicDialogModule,
    TituloPrincipalModule,
    DialogModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    SelectButtonModule,
    CalendarModule,
    FullCalendarModule,
    AccordionModule,
  ],
  providers:[
    CapillaReservacionService
  ]
})

export class CapillaReservacionModule {

}
