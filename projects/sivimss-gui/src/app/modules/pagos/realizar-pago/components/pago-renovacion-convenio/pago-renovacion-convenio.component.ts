import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {TIPO_PAGO_CATALOGOS_CONVENIO} from "../../constants/catalogos";
import {LazyLoadEvent} from "primeng/api";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {RegistrarTipoPagoComponent} from "../registrar-tipo-pago/registrar-tipo-pago.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {PagoEspecifico} from "../../modelos/pagoEspecifico.interface";
import {validarUsuarioLogueado} from "../../../../../utils/funciones";

interface RegistroModal {
  tipoPago: string,
  idPago: string,
  total: number,
  datosRegistro: DatosRegistro
}

interface DatosRegistro {
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number
}

@Component({
  selector: 'app-pago-renovacion-convenio',
  templateUrl: './pago-renovacion-convenio.component.html',
  styleUrls: ['./pago-renovacion-convenio.component.scss'],
  providers: [DialogService]
})
export class PagoRenovacionConvenioComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  pagos: PagoEspecifico[] = [];
  pagoSeleccionado: any;
  pagoConvenioModal: boolean = false;
  tipoPago: TipoDropdown[] = TIPO_PAGO_CATALOGOS_CONVENIO;
  pagoForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              public dialogService: DialogService,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService
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

  private paginar(): void {
    this.cargadorService.activar();
    this.realizarPagoService.consultarPagosRenovacionConvenio(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        const ERROR: string = 'Error al guardar la información de la Pago de Renovación de Convenios de Previsión Funeraria. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error);
      },
    });
  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  abrirModalPago(): void {
    this.registrarPago();
    const idPago = this.pagoForm.get('tipoPago')?.value;
    const tipoPago: string = this.tipoPago.find(tp => tp.value === idPago)?.label ?? '';
    const data: RegistroModal = {
      tipoPago, idPago,
      total: this.pagoSeleccionado.diferenciasTotales,
      datosRegistro: {
        idPagoBitacora: this.pagoSeleccionado.idPagoBitacora,
        idFlujoPago: this.pagoSeleccionado.idFlujoPago,
        idRegistro: this.pagoSeleccionado.idRegistro,
        importePago: this.pagoSeleccionado.total
      }
    }
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
      data
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
  }

  registrarPago(): void {
    this.pagoConvenioModal = !this.pagoConvenioModal;
  }

}
