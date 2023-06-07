import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {TIPO_PAGO_CATALOGOS_CONVENIO} from "../../constants/dummies";
import {LazyLoadEvent} from "primeng/api";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {RegistrarTipoPagoComponent} from "../registrar-tipo-pago/registrar-tipo-pago.component";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {PagoEspecifico} from "../../modelos/pagoEspecifico.interface";

@Component({
  selector: 'app-pago-convenio',
  templateUrl: './pago-convenio.component.html',
  styleUrls: ['./pago-convenio.component.scss'],
  providers: [DialogService]
})
export class PagoConvenioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  pagoConvenioModal: boolean = false;
  tipoPago: TipoDropdown[] = TIPO_PAGO_CATALOGOS_CONVENIO;
  pagoForm!: FormGroup;

  pagos: PagoEspecifico[] = [];

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
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    this.paginar();
  }

  private paginar(): void {
    this.cargadorService.activar();
    this.realizarPagoService.consultarPagosConvenio(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      },
    });
  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);
  }

  abrirModalPago(): void {
    this.registrarPago();
    const tipoPago = this.pagoForm.get('tipoPago')?.value;
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
      data: tipoPago
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
  }

  registrarPago(): void {
    this.pagoConvenioModal = !this.pagoConvenioModal;
  }
}
