import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { FacturacionComponent } from './components/facturacion/facturacion.component';
import { SolicitarFacturaComponent } from './components/solicitar-factura/solicitar-factura.component';
import {TituloPrincipalModule} from "../../../shared/titulo-principal/titulo-principal.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {UtileriaModule} from "../../../shared/utileria/utileria.module";
import {ValidaRolModule} from "../../../shared/valida-rol/valida-rol.module";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {OverlayPanelOpcionesModule} from "../../../shared/overlay-panel-opciones/overlay-panel-opciones.module";
import {TableModule} from "primeng/table";
import {InputSwitchModule} from "primeng/inputswitch";
import { CancelarFacturaComponent } from './components/cancelar-factura/cancelar-factura.component';
import { EnviarFacturaComponent } from './components/enviar-factura/enviar-factura.component';
import {TablePanelModule} from "../../../shared/table-panel/table-panel.module";
import { VerDetalleFacturaComponent } from './components/ver-detalle-factura/ver-detalle-factura.component';
import {AccordionModule} from "primeng/accordion";
import {FacturacionService} from "./services/facturacion.service";
import {BtnRegresarModule} from "../../../shared/btn-regresar/btn-regresar.module";
import { DatosContratanteComponent } from './components/datos-contratante/datos-contratante.component';
import { DatosReceptorComponent } from './components/datos-receptor/datos-receptor.component';
import {DialogModule} from "primeng/dialog";
import {CeldaStickyModule} from "../../../shared/celda-sticky/celda-sticky.module";


@NgModule({
  declarations: [
    FacturacionComponent,
    SolicitarFacturaComponent,
    CancelarFacturaComponent,
    EnviarFacturaComponent,
    VerDetalleFacturaComponent,
    DatosContratanteComponent,
    DatosReceptorComponent
  ],
    imports: [
        CommonModule,
        FacturacionRoutingModule,
        TituloPrincipalModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        CalendarModule,
        UtileriaModule,
        ValidaRolModule,
        OverlayPanelModule,
        OverlayPanelOpcionesModule,
        TableModule,
        InputSwitchModule,
        NgOptimizedImage,
        TablePanelModule,
        AccordionModule,
        BtnRegresarModule,
        DialogModule,
        CeldaStickyModule
    ],
  providers: [FacturacionService]
})
export class FacturacionModule { }
