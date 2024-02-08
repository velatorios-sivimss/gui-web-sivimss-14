import {Component, OnInit, ViewChild} from '@angular/core';
import {DetallePago, MetodoPago} from "../../modelos/detallePago.interface";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {TIPO_PAGO_CATALOGOS_CONVENIO, TIPO_PAGO_CATALOGOS_ODS} from "../../constants/catalogos";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {RegistrarTipoPagoComponent} from "../registrar-pago/registrar-tipo-pago/registrar-tipo-pago.component";
import {OverlayPanel} from "primeng/overlaypanel";
import {ModificarTipoPagoComponent} from "../modificar-tipo-pago/modificar-tipo-pago.component";
import {EliminarTipoPagoComponent} from "../eliminar-tipo-pago/eliminar-tipo-pago.component";
import {
  RegistrarValeParitariaComponent
} from "../registrar-pago/registrar-vale-paritaria/registrar-vale-paritaria.component";
import {ParametrosEliminar, RegistroModal} from "../../modelos/datosRegistro.interface";
import {RegistrarAgfComponent} from "../registrar-pago/registrar-agf/registrar-agf.component";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {forkJoin, Observable} from "rxjs";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {validarUsuarioLogueado} from "../../../../../utils/funciones";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";

interface DialogoAGF {
  idFinado: number,
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number,
}

interface RespuestaAGF {
  idODS: number,
  agf: number,
  nss: null | number,
  idFinado: null | number
}

interface ParametrosModificar {
  pago: MetodoPago,
  tipoPago: string,
  total: number,
  totalPagado: number
}

@Component({
  selector: 'app-control-pago',
  templateUrl: './control-pago.component.html',
  styleUrls: ['./control-pago.component.scss'],
  providers: [DialogService]
})
export class ControlPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  registroPago!: DetallePago;
  pagoSeleccionado!: MetodoPago;

  idPagoBitacora!: number;
  fecha: Date = new Date();
  tipoPago: string = '';
  tipoFolio: string = '';
  titulo: string = '';
  tiposPago: TipoDropdown[] = [];
  pagoForm!: FormGroup;
  agfSeleccionado!: RespuestaAGF;

  constructor(
    private formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    private realizarPagoService: RealizarPagoService,
    public dialogService: DialogService,
    private cargadorService: LoaderService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarFormPago();
    this.cargarCatalogos();
  }

  inicializarFormPago(): void {
    this.pagoForm = this.formBuilder.group({
      tipoPago: [{value: null, disabled: false}]
    });
  }

  cargarCatalogos(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
    this.tipoPago = this.obtenerTipoPago();
    this.titulo = this.obtenerTipoPago();
    this.tipoFolio = this.obtenerFolioTipoPago();
    if (validarUsuarioLogueado()) return;
    this.obtenerMetodosPago();
    this.idPagoBitacora = this.activatedRoute.snapshot.paramMap.get('idPagoBitacora') as unknown as number;
    this.actualizarValidaciones();
  }

  obtenerFolioTipoPago(): string {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return 'Folio ODS'
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return 'Folio NCPF';
    }
    return 'Folio PRCPF';
  }

  obtenerTipoPago(): string {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return 'Pago de orden de servicio'
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return 'Pago de Nuevos convenios de previsión funeraria';
    }
    return 'Pago de Renovación de convenios de previsión funeraria';
  }

  obtenerMetodosPago(): void {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      this.filtrarCatalogosODS();
      return;
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      this.tiposPago = TIPO_PAGO_CATALOGOS_CONVENIO;
      return;
    }
    this.tiposPago = TIPO_PAGO_CATALOGOS_CONVENIO;
  }

  validarAGF(idOds: number): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarIdODSAGF(idOds);
  }

  validarVale(idOds: number): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarIdODSVale(idOds);
  }

  filtrarCatalogosODS(): void {
    const ID: number = this.registroPago.idRegistro;
    this.cargadorService.activar();
    forkJoin([this.validarAGF(ID), this.validarVale(ID)]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]) => this.procesarRespuestaCatalogos(respuesta)
    })
  }

  procesarRespuestaCatalogos(respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]): void {
    let CATALOGOS: TipoDropdown[] = [...TIPO_PAGO_CATALOGOS_ODS]
    const POSICION_VALIDACION_AGF: number = 0;
    const POSICION_VALIDACION_VALE: number = 1;
    this.agfSeleccionado = respuesta[POSICION_VALIDACION_AGF].datos;
    if (this.agfSeleccionado.agf === 0) {
      CATALOGOS = CATALOGOS.filter((pago: TipoDropdown) => ![2].includes(pago.value as number));
    }
    const valeSeleccionado = respuesta[POSICION_VALIDACION_VALE].datos;
    if (valeSeleccionado.valeP === 0) {
      CATALOGOS = CATALOGOS.filter((pago: TipoDropdown) => ![1].includes(pago.value as number));
    }
    this.tiposPago = CATALOGOS;
  }

  seleccionarPago(): void {
    const tipoPago: number = this.pagoForm.get('tipoPago')?.value as number;
    if (tipoPago === 1) {
      this.abrirModalValeParitaria();
      return;
    }
    if (tipoPago === 2) {
      this.abrirModalAGF();
      return;
    }
    this.registrarPago();
  }

  registrarPago(): void {
    const idPago = this.pagoForm.get('tipoPago')?.value;
    const tipoPago: string = this.obtenerTipoPagoSeleccionado(idPago);
    const data: RegistroModal = this.generarDatosDialogo();
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = this.crearConfiguracionDialogo(`Registro de ${tipoPago.toLowerCase()}`, data)
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
  }

  obtenerTipoPagoSeleccionado(idPago: number): string {
    const tipoPago: string | undefined = this.tiposPago.find((tp: TipoDropdown) => tp.value === idPago)?.label
    return tipoPago ?? ''
  }

  crearConfiguracionDialogo(header: string, data: RegistroModal | ParametrosEliminar | ParametrosModificar | DialogoAGF): DynamicDialogConfig {
    return {header, width: MAX_WIDTH, data}
  }

  abrirModalValeParitaria(): void {
    const data: RegistroModal = this.generarDatosDialogo();
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = this.crearConfiguracionDialogo('Registro de Vale Paritaria', data);
    this.dialogService.open(RegistrarValeParitariaComponent, REGISTRAR_PAGO_CONFIG)
  }

  generarDatosDialogo(): RegistroModal {
    const idPago = this.pagoForm.get('tipoPago')?.value;
    const tipoPago: string = this.tiposPago.find((tp: TipoDropdown) => tp.value === idPago)?.label ?? '';
    return {
      tipoPago, idPago,
      total: this.registroPago.totalAPagar,
      totalPendiente: this.registroPago.totalPorCubrir,
      datosRegistro: {
        idPagoBitacora: this.registroPago.idPagoBitacora,
        idFlujoPago: this.registroPago.idFlujoPago,
        idRegistro: this.registroPago.idRegistro,
      }
    }
  }

  regresarPaginaPrevia(): void {
    this.location.back();
  }

  mostrarOverlay(event: MouseEvent, pago: MetodoPago): void {
    event.stopPropagation();
    this.pagoSeleccionado = pago;
    this.overlayPanel.toggle(event);
  }

  modificarTipoPago(): void {
    const data: ParametrosModificar = this.generarDatosDialogoModificar();
    const MODIFICAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = this.crearConfiguracionDialogo('Modificar metodo de pago', data);
    this.dialogService.open(ModificarTipoPagoComponent, MODIFICAR_TIPO_PAGO_CONFIG)
  }

  generarDatosDialogoModificar(): ParametrosModificar {
    return {
      pago: this.pagoSeleccionado,
      tipoPago: this.registroPago.tipoPago,
      total: this.registroPago.totalAPagar,
      totalPagado: this.registroPago.totalPagado
    };
  }

  eliminarTipoPago(): void {
    const data: ParametrosEliminar = this.generarDatosDialogoEliminar();
    const CANCELAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = this.crearConfiguracionDialogo('Eliminar método de pago registrado', data);
    this.dialogService.open(EliminarTipoPagoComponent, CANCELAR_TIPO_PAGO_CONFIG);
  }

  generarDatosDialogoEliminar(): ParametrosEliminar {
    return {
      pago: this.pagoSeleccionado,
      total: this.registroPago.totalAPagar
    }
  }

  actualizarValidaciones(): void {
    if (this.registroPago.totalPorCubrir > 0) return;
    this.pagoForm.get('tipoPago')?.disable();
  }

  abrirModalAGF(): void {
    const data: DialogoAGF = this.generarDatosDialogoAGF();
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = this.crearConfiguracionDialogo("Registro de Ayuda de Gastos de Funeral", data);
    this.dialogService.open(RegistrarAgfComponent, REGISTRAR_PAGO_CONFIG);
  }

  generarDatosDialogoAGF(): DialogoAGF {
    return {
      idFinado: this.registroPago.idFinado,
      idPagoBitacora: this.registroPago.idPagoBitacora,
      idFlujoPago: this.registroPago.idFlujoPago,
      idRegistro: this.registroPago.idRegistro,
      importePago: this.registroPago.totalPorCubrir,
    }
  }

}
