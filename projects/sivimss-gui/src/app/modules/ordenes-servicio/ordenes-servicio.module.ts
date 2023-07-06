import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ModalAgregarServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-servicio/modal-agregar-servicio.component';
import { ModalGenerarTarjetaIdentificacionComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component';
import { ModalVerTarjetaIdentificacionComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-tarjeta-identificacion/modal-ver-tarjeta-identificacion.component';
import { OrdenesServicioRoutingModule } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/ordenes-servicio-routing.module';
import { OrdenesServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/ordenes-servicio/ordenes-servicio.component';
import { EtapasModule } from 'projects/sivimss-gui/src/app/shared/etapas/etapas.module';
import { OverlayPanelOpcionesModule } from 'projects/sivimss-gui/src/app/shared/overlay-panel-opciones/overlay-panel-opciones.module';
import { TablePanelModule } from 'projects/sivimss-gui/src/app/shared/table-panel/table-panel.module';
import { TituloPrincipalModule } from 'projects/sivimss-gui/src/app/shared/titulo-principal/titulo-principal.module';
import { GenerarOrdenServicioComponent } from './components/generar-orden-servicio/generar-orden-servicio.component';
import { DatosContratanteComponent } from './components/datos-contratante/datos-contratante.component';
import { DatosFinadoComponent } from './components/datos-finado/datos-finado.component';
import { CancelarOrdenServicioComponent } from './components/cancelar-orden-servicio/cancelar-orden-servicio.component';
import { VerOrdenServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/ver-orden-de-servicio/ver-orden-servicio.component';
import { ModificarDatosContratanteComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modificar-datos-contratante/modificar-datos-contratante.component';
import { ModalSeleccionarBeneficiarioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component';
import { CaracteristicasPresupuestoComponent } from './components/caracteristicas-presupuesto/caracteristicas-presupuesto.component';
import { ModalVerKilometrajeComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-kilometraje/modal-ver-kilometraje.component';
import { InformacionServicioComponent } from './components/informacion-servicio/informacion-servicio.component';
import { ResumenOrdenComplementariaComponent } from './components/resumen-orden-complementaria/resumen-orden-complementaria.component';
import { VerOrdenComplementariaComponent } from './components/ver-orden-complementaria/ver-orden-complementaria.component';
import { ModalAgregarAlPresupuestoComponent } from './components/modal-agregar-al-presupuesto/modal-agregar-al-presupuesto.component';
import { ModalAgregarAlPaqueteComponent } from './components/modal-agregar-al-paquete/modal-agregar-al-paquete.component';
import { ModalAgregarAtaudComponent } from './components/modal-agregar-ataud/modal-agregar-ataud.component';
import { ModalEliminarArticuloComponent } from './components/modal-eliminar-articulo/modal-eliminar-articulo.component';
import { ModalNoUtilizarArticuloComponent } from './components/modal-no-utilizar-articulo/modal-no-utilizar-articulo.component';
import { ModalNoUtilizarServicioComponent } from './components/modal-no-utilizar-servicio/modal-no-utilizar-servicio.component';
import { ModalDonarArticuloComponent } from './components/modal-donar-articulo/modal-donar-articulo.component';
import { ModalAgregarPanteonComponent } from './components/modal-agregar-panteon/modal-agregar-panteon.component';
import { ModificarDatosFinadoComponent } from './components/modificar-datos-finado/modificar-datos-finado.component';
import { ModificarInformacionServicioComponent } from './components/modificar-informacion-servicio/modificar-informacion-servicio.component';
import { UtileriaModule } from '../../shared/utileria/utileria.module';
import { GenerarOrdenServicioService } from './services/generar-orden-servicio.service';
import { GestionarEtapasService } from './services/gestionar-etapas.service';
import { ModalAgregarUrnaComponent } from './components/modal-agregar-urna/modal-agregar-urna.component';
import { ModalAgregarEmpaqueComponent } from './components/modal-agregar-empaque/modal-agregar-empaque.component';
import { ModalAgregarArticulosComplementariosComponent } from './components/modal-agregar-articulos-complementarios/modal-agregar-articulos-complementarios.component';

import { ConsultarOrdenServicioService } from './services/consultar-orden-servicio.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BtnRegresarModule } from '../../shared/btn-regresar/btn-regresar.module';
import { CeldaStickyModule } from '../../shared/celda-sticky/celda-sticky.module';
import { ActualizarOrdenServicioComponent } from './components/actualizar-orden-servicio/actualizar-orden-servicio.component';
@NgModule({
  declarations: [
    OrdenesServicioComponent,
    GenerarOrdenServicioComponent,
    DatosContratanteComponent,
    DatosFinadoComponent,
    CancelarOrdenServicioComponent,
    VerOrdenServicioComponent,
    ModalGenerarTarjetaIdentificacionComponent,
    ModificarDatosContratanteComponent,
    ModalVerTarjetaIdentificacionComponent,
    ModalSeleccionarBeneficiarioComponent,
    CaracteristicasPresupuestoComponent,
    ModalVerKilometrajeComponent,
    ModalAgregarServicioComponent,
    InformacionServicioComponent,
    ResumenOrdenComplementariaComponent,
    VerOrdenComplementariaComponent,
    ModalAgregarAlPresupuestoComponent,
    ModalAgregarAlPaqueteComponent,
    ModalAgregarAtaudComponent,
    ModalEliminarArticuloComponent,
    ModalNoUtilizarArticuloComponent,
    ModalNoUtilizarServicioComponent,
    ModalDonarArticuloComponent,
    ModalAgregarPanteonComponent,
    ModificarDatosFinadoComponent,
    ModificarInformacionServicioComponent,
    ModalAgregarUrnaComponent,
    ModalAgregarEmpaqueComponent,
    ModalAgregarArticulosComplementariosComponent,
    ActualizarOrdenServicioComponent,
  ],
  imports: [
    CommonModule,
    OrdenesServicioRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TituloPrincipalModule,
    TableModule,
    InputSwitchModule,
    DialogModule,
    CalendarModule,
    OverlayPanelModule,
    OverlayPanelOpcionesModule,
    TablePanelModule,
    CheckboxModule,
    RadioButtonModule,
    AccordionModule,
    DynamicDialogModule,
    EtapasModule,
    UtileriaModule,
    AutoCompleteModule,
    BtnRegresarModule,
    CeldaStickyModule,
  ],
  providers: [
    GenerarOrdenServicioService,
    DialogService,
    GestionarEtapasService,
    ConsultarOrdenServicioService,
  ],
})
export class OrdenesServicioModule {}
