import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {FormBuilder, FormGroup, FormGroupDirective, Validators} from "@angular/forms";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {RegistrarTipoPagoComponent} from "../../registrar-pago/registrar-tipo-pago/registrar-tipo-pago.component";
import {RegistrarAgfComponent} from "../../registrar-pago/registrar-agf/registrar-agf.component";
import {
  RegistrarValeParitariaComponent
} from "../../registrar-pago/registrar-vale-paritaria/registrar-vale-paritaria.component";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {PagoEspecifico} from "../../../modelos/pagoEspecifico.interface";
import {validarUsuarioLogueado} from "../../../../../../utils/funciones";
import {TIPO_PAGO_CATALOGOS_ODS} from "../../../constants/catalogos";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {forkJoin, Observable} from "rxjs";

interface DatosRegistro {
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number
}

interface RegistroModal {
  tipoPago?: string,
  idPago?: string,
  idFinado?: number,
  total: number,
  datosRegistro: DatosRegistro
}

interface RespuestaAGF {
  idODS: number,
  agf: number,
  nss: null | number,
  idFinado: null | number
}

@Component({
  selector: 'app-pago-orden-servicio',
  templateUrl: './pago-orden-servicio.component.html',
  styleUrls: ['./pago-orden-servicio.component.scss'],
  providers: [DialogService]
})
export class PagoOrdenServicioComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  pagos: PagoEspecifico[] = [];
  pagoSeleccionado!: PagoEspecifico;
  agfSeleccionado!: RespuestaAGF;
  pagoODSModal: boolean = false;
  tipoPago: TipoDropdown[] = [];
  pagoForm!: FormGroup;

  banderaAGF: boolean = false;

  constructor(private formBuilder: FormBuilder,
              public dialogService: DialogService,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarFormPago();
  }

  inicializarFormPago(): void {
    this.pagoForm = this.formBuilder.group({
      tipoPago: [{value: null, disabled: false}, [Validators.required]]
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    this.paginar();
  }

  paginar(): void {
    this.cargadorService.activar();
    this.realizarPagoService.consultarPagosODS(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.respuestaPaginarODS(respuesta),
      error: (error: HttpErrorResponse): void => this.mostrarMensajeError(error)
    });
  }

  private respuestaPaginarODS(respuesta: HttpRespuesta<any>): void {
    this.pagos = respuesta.datos.content;
    this.totalElementos = respuesta.datos.totalElements;
  }

  private mostrarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  abrirPanel(event: MouseEvent, pago: PagoEspecifico): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  registrarPago(): void {
    this.filtroFormDir.resetForm();
    this.filtrarCatalogosODS();
    this.pagoODSModal = true;
  }

  validarAGF(idOds: number): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarIdODSAGF(idOds);
  }

  filtrarCatalogosODS(): void {
    const ID: number = this.pagoSeleccionado.idRegistro;
    this.cargadorService.activar();
    forkJoin([this.validarAGF(ID)]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: [HttpRespuesta<any>]) => this.procesarRespuestaCatalogos(respuesta)
    })
  }

  procesarRespuestaCatalogos(respuesta: [HttpRespuesta<any>]): void {
    let CATALOGOS: TipoDropdown[] = [...TIPO_PAGO_CATALOGOS_ODS]
    const POSICION_VALIDACION_AGF: number = 0
    this.agfSeleccionado = respuesta[POSICION_VALIDACION_AGF].datos;
    if (this.agfSeleccionado.agf === 0) {
      CATALOGOS = CATALOGOS.filter((pago: TipoDropdown) => ![2].includes(pago.value as number));
    }
    this.tipoPago = CATALOGOS;
  }

  seleccionarPago(): void {
    this.pagoODSModal = false;
    const tipoPago = this.pagoForm.get('tipoPago')?.value;
    if (tipoPago === 1) {
      this.abrirModalValeParitaria();
      return;
    }
    if (tipoPago === 2) {
      this.abrirModalAGF();
      return;
    }
    this.abrirModalPago(tipoPago);
  }

  abrirModalValeParitaria(): void {
    const data: RegistroModal = {
      total: this.pagoSeleccionado.diferenciasTotales,
      datosRegistro: {
        idPagoBitacora: this.pagoSeleccionado.idPagoBitacora,
        idFlujoPago: this.pagoSeleccionado.idFlujoPago,
        idRegistro: this.pagoSeleccionado.idRegistro,
        importePago: this.pagoSeleccionado.total,
      }
    }
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
      data
    }
    this.dialogService.open(RegistrarValeParitariaComponent, REGISTRAR_PAGO_CONFIG)
  }

  abrirModalAGF(): void {
    const data = {
      idFinado: this.agfSeleccionado.idFinado,
      idPagoBitacora: this.pagoSeleccionado.idPagoBitacora,
      idFlujoPago: this.pagoSeleccionado.idFlujoPago,
      idRegistro: this.pagoSeleccionado.idRegistro,
      importePago: this.pagoSeleccionado.total,
    }
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      data,
      header: "Registro de Ayuda de Gastos de Funeral",
      width: MAX_WIDTH,
    }
    this.dialogService.open(RegistrarAgfComponent, REGISTRAR_PAGO_CONFIG)
  }

  abrirModalPago(idPago: string): void {
    const tipoPago: string = this.tipoPago.find(tp => tp.value === idPago)?.label ?? '';
    const data: RegistroModal = {
      tipoPago, idPago,
      total: this.pagoSeleccionado.diferenciasTotales,
      datosRegistro: {
        idPagoBitacora: this.pagoSeleccionado.idPagoBitacora,
        idFlujoPago: this.pagoSeleccionado.idFlujoPago,
        idRegistro: this.pagoSeleccionado.idRegistro,
        importePago: this.pagoSeleccionado.total,
      }
    }
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
      data
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
  }

  get odsf() {
    return this.pagoForm?.controls;
  }

}
