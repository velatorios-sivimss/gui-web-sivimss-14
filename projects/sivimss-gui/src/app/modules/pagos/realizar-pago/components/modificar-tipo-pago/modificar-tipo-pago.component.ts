import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TIPO_PAGO_CATALOGOS_CONVENIO, TIPO_PAGO_CATALOGOS_ODS} from "../../constants/catalogos";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";

interface SolicitudModificacionPago {
  idPagoDetalle: number,
  importePago: number,
  cambioMetPago: boolean,
  descBanco: string,
  idMetodoPago: number,
  numAutorizacion: string
}

@Component({
  selector: 'app-modificar-tipo-pago',
  templateUrl: './modificar-tipo-pago.component.html',
  styleUrls: ['./modificar-tipo-pago.component.scss']
})
export class ModificarTipoPagoComponent implements OnInit {

  pagosDeshabilitados: number[] = [5, 8];
  fechasDeshabilitadas: number[] = [3, 4, 5];
  idPago: number = 0;
  total: number = 0;

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoModificarPago: number = 1;

  tipoPagoForm!: FormGroup;
  tipoPagos: any[] = [];
  tipoPago: string = '';
  resumenSolicitud!: any;
  idPagoDetalle!: number;

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private realizarPagoService: RealizarPagoService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.inicializarTipoPagoForm();
    this.llenarCatalogos();
  }

  cancelar(): void {
    this.ref.close();
  }

  aceptar(): void {
    this.resumenSolicitud = this.tipoPagoForm.getRawValue();
    this.pasoModificarPago = this.RESUMEN_DE_PAGO;
  }

  inicializarTipoPagoForm(): void {
    this.tipoPagoForm = this.formBuilder.group({
      tipoPagoAnterior: [{value: '', disabled: true}],
      tipoPago: [{value: '', disabled: false}, [Validators.required]],
      fecha: [{value: null, disabled: false}, [Validators.required]],
      noAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      nombreBanco: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  llenarCatalogos(): void {
    this.tipoPagoForm.get('tipoPagoAnterior')?.patchValue(this.config.data.metodoPago);
    this.idPagoDetalle = this.config.data.idPagoDetalle;
    this.total = this.config.data.importe;
    if (this.config.data.tipoPago === 'Pago de Orden de Servicio') {
      this.tipoPagos = TIPO_PAGO_CATALOGOS_ODS.filter(t => ![1, 2].includes(t.value));
      return;
    }
    this.tipoPagos = TIPO_PAGO_CATALOGOS_CONVENIO;
  }

  seleccionarId(): void {
    this.idPago = +this.tipoPagoForm.get('tipoPago')?.value;
    this.tipoPago = this.tipoPagos.find(tP => tP.value === this.idPago).label;
    this.validarCamposRequeridos(this.idPago);
  }

  validarCamposRequeridos(id: number): void {
    this.tipoPagoForm.get('importe')?.patchValue(null);
    this.tipoPagoForm.get('fecha')?.patchValue(null);
    this.tipoPagoForm.get('noAutorizacion')?.patchValue(null);
    this.tipoPagoForm.get('nombreBanco')?.patchValue(null);
    this.tipoPagoForm.get('importe')?.clearValidators();
    this.tipoPagoForm.get('importe')?.addValidators([Validators.required]);
    this.tipoPagoForm.get('fecha')?.addValidators([Validators.required]);
    this.tipoPagoForm.get('noAutorizacion')?.addValidators([Validators.required]);
    this.tipoPagoForm.get('nombreBanco')?.addValidators([Validators.required]);
    if (this.fechasDeshabilitadas.includes(+id)) {
      this.tipoPagoForm.get('fecha')?.clearValidators();
      this.tipoPagoForm.get('fecha')?.updateValueAndValidity();
    }
    if (this.pagosDeshabilitados.includes(+id)) {
      this.tipoPagoForm.get('noAutorizacion')?.clearValidators();
      this.tipoPagoForm.get('noAutorizacion')?.updateValueAndValidity();
      this.tipoPagoForm.get('nombreBanco')?.clearValidators();
      this.tipoPagoForm.get('nombreBanco')?.updateValueAndValidity();
    }
    if (+id === 8) {
      this.tipoPagoForm.get('importe')?.addValidators([Validators.max(this.total), Validators.min(this.total)]);
    }
  }

  get pf() {
    return this.tipoPagoForm?.controls
  }

  guardar(): void {
    const solicitud: SolicitudModificacionPago = this.generarSolicitud();
    this.realizarPagoService.modificarMetodoPago(solicitud).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago modificado correctamente');
        this.ref.close();
        this.actualizarPagina();
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  generarSolicitud(): SolicitudModificacionPago {
    return {
      cambioMetPago: this.tipoPago === this.config.data.metodoPago,
      descBanco: this.tipoPagoForm.get('nombreBanco')?.value,
      idMetodoPago: this.tipoPagoForm.get('tipoPago')?.value,
      idPagoDetalle: this.idPagoDetalle,
      importePago: this.tipoPagoForm.get('importe')?.value,
      numAutorizacion: this.tipoPagoForm.get('noAutorizacion')?.value
    }
  }

  actualizarPagina(): void {
    const currentUrl: string = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      void this.router.navigate([currentUrl]);
    });
  }
}
