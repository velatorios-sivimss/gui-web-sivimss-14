import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { StepsModule } from "primeng/steps";
import { CalendarModule } from "primeng/calendar";
import { OverlayPanelOpcionesModule } from "projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module";
import { TituloPrincipalModule } from "../../shared/titulo-principal/titulo-principal.module";
import { TablePanelModule } from "projects/sivimss-gui/src/app/shared/table-panel/table-panel.module";
import { CeldaStickyModule } from "../../shared/celda-sticky/celda-sticky.module";
import { GenerarOrdenSubrogacionService } from "./services/generar-orden-subrogacion.service";
import { BtnRegresarModule } from "../../shared/btn-regresar/btn-regresar.module";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { UtileriaModule } from "../../shared/utileria/utileria.module";
import { ValidaRolModule } from "../../shared/valida-rol/valida-rol.module";
import { GenerarOrdenSubrogacionComponent } from "./components/generar-orden-subrogacion/generar-orden-subrogacion.component";
import { DetalleGenerarOrdenComponent } from './components/detalle-generar-orden/detalle-generar-orden.component';
import { GenerarOrdenSubrogacionRoutingModule } from "./generar-orden-subrogacion-routing.module";
import { AutoCompleteModule } from "primeng/autocomplete";
import { GenerarOrdenFormatoComponent } from "./components/generar-orden-formato/generar-orden-formato.component";
import { RadioButtonModule } from "primeng/radiobutton";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { PrevisualizacionArchivoComponent } from "./components/previsualizacion-archivo/previsualizacion-archivo.component";

@NgModule({
  declarations: [
    GenerarOrdenSubrogacionComponent,
    DetalleGenerarOrdenComponent,
    GenerarOrdenFormatoComponent,
    PrevisualizacionArchivoComponent,
  ],
  imports: [
    CommonModule,
    GenerarOrdenSubrogacionRoutingModule,
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
    StepsModule,
    CalendarModule,
    BtnRegresarModule,
    ConfirmDialogModule,
    UtileriaModule,
    AutoCompleteModule,
    ValidaRolModule,
    RadioButtonModule,
    PdfViewerModule,
  ],
  providers: [
    GenerarOrdenSubrogacionService
  ],
})
export class GenerarOrdenSubrogacionModule { }
