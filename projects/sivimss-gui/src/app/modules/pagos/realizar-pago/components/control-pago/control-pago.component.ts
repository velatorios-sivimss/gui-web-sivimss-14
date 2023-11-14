import {Component, OnInit, ViewChild} from '@angular/core';
import {DetallePago, MetodoPago} from "../../modelos/detallePago.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {TIPO_PAGO_CATALOGOS_CONVENIO, TIPO_PAGO_CATALOGOS_ODS} from "../../constants/catalogos";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {RegistrarTipoPagoComponent} from "../registrar-pago/registrar-tipo-pago/registrar-tipo-pago.component";
import {OverlayPanel} from "primeng/overlaypanel";
import {ModificarTipoPagoComponent} from "../modificar-tipo-pago/modificar-tipo-pago.component";
import {EliminarTipoPagoComponent} from "../eliminar-tipo-pago/eliminar-tipo-pago.component";

interface DatosRegistro {
  idPagoBitacora?: number,
  idFlujoPago?: number,
  idRegistro?: number,
  importePago: number
}

interface RegistroModal {
  tipoPago: string,
  idPago: string,
  total: number,
  datosRegistro: DatosRegistro
}

interface ParametrosModificar {
  metodoPago: string,
  tipoPago: string,
  importe: number,
  idPagoDetalle: number
}

interface ParametrosCancelar {
  pago: MetodoPago,
  total: number
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
  generarPagare: boolean = false;
  pagoForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    public dialogService: DialogService,
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
    this.tiposPago = this.obtenerMetodosPago();
    this.idPagoBitacora = this.activatedRoute.snapshot.paramMap.get('idPagoBitacora') as unknown as number;
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

  obtenerMetodosPago(): TipoDropdown[] {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return TIPO_PAGO_CATALOGOS_ODS;
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return TIPO_PAGO_CATALOGOS_CONVENIO;
    }
    return TIPO_PAGO_CATALOGOS_CONVENIO;
  }

  registrarPago(): void {
    const idPago = this.pagoForm.get('tipoPago')?.value;
    const tipoPago: string = this.tiposPago.find((tp: TipoDropdown) => tp.value === idPago)?.label ?? '';
    const data: RegistroModal = {
      tipoPago, idPago,
      total: this.registroPago.totalPorCubrir,
      datosRegistro: {
        idPagoBitacora: this.registroPago.idPagoBitacora,
        idFlujoPago: this.registroPago.idFlujoPago,
        idRegistro: this.registroPago.idRegistro,
        importePago: this.registroPago.totalPagado
      }
    }
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: `Registro de ${tipoPago.toLowerCase()}`,
      width: MAX_WIDTH,
      data
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
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
    const data: ParametrosModificar = {
      metodoPago: this.pagoSeleccionado.metodoPago, importe: this.pagoSeleccionado.importe,
      tipoPago: this.registroPago.tipoPago, idPagoDetalle: this.pagoSeleccionado.idPagoDetalle
    };
    const MODIFICAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Modificar pago",
      width: MAX_WIDTH,
      data
    };
    this.dialogService.open(ModificarTipoPagoComponent, MODIFICAR_TIPO_PAGO_CONFIG)
  }

  cancelarTipoPago(): void {
    const data: ParametrosCancelar = {
      pago: this.pagoSeleccionado,
      total: this.registroPago.totalAPagar
    };
    const CANCELAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Cancelar pago",
      width: MAX_WIDTH,
      data
    };
    this.dialogService.open(EliminarTipoPagoComponent, CANCELAR_TIPO_PAGO_CONFIG);
  }

}
