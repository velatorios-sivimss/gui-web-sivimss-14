import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudCrearPago} from "../../modelos/solicitudPago.interface";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import * as moment from "moment/moment";

interface DatosRegistro {
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number
}

@Component({
  selector: 'app-registrar-tipo-pago',
  templateUrl: './registrar-tipo-pago.component.html',
  styleUrls: ['./registrar-tipo-pago.component.scss']
})
export class RegistrarTipoPagoComponent implements OnInit {

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoAgregarPago: number = 1;

  tipoPagoForm!: FormGroup;
  indice: number = 0;

  registroPago!: DatosRegistro;
  tipoPago!: string;
  idPago!: number;
  total: number = 0;
  pagos: string[] = ["Traslado oficial", "Efectivo"]
  fechasDeshabilitadas = [3, 4]
  resumenSolicitud!: any;

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private realizarPagoService: RealizarPagoService,
  ) {
  }

  ngOnInit(): void {
    this.tipoPago = this.config.data.tipoPago;
    this.idPago = this.config.data.idPago;
    this.total = this.config.data.total;
    this.registroPago = this.config.data.datosRegistro;
    this.inicializarTipoPagoForm();
    this.validarCamposRequeridos(this.idPago);
  }

  inicializarTipoPagoForm(): void {
    this.tipoPagoForm = this.formBuilder.group({
      tipoPago: [{value: this.tipoPago, disabled: true}],
      fecha: [{value: null, disabled: false}, [Validators.required]],
      noAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      nombreBanco: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  validarCamposRequeridos(id: number): void {
    if (this.fechasDeshabilitadas.includes(id)) {
      this.tipoPagoForm.get('fecha')?.clearValidators();
    }
  }

  aceptar(): void {
    this.resumenSolicitud = this.tipoPagoForm.getRawValue();
    this.pasoAgregarPago = this.RESUMEN_DE_PAGO;
  }

  guardar(): void {
    const solicitudPago: SolicitudCrearPago = this.generarSolicitudPago();
    console.log(solicitudPago);
    this.realizarPagoService.guardar(solicitudPago).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        console.log(respuesta);
        this.ref.close();
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  generarSolicitudPago(): SolicitudCrearPago {
    let fechaPago = this.tipoPagoForm.get('fecha')?.value;
    if (fechaPago) fechaPago = moment(fechaPago).format('YYYY-MM-DD');
    return {
      descBanco: this.tipoPagoForm.get('nombreBanco')?.value,
      fechaPago,
      fechaValeAGF: null,
      idFlujoPago: this.registroPago.idFlujoPago,
      idMetodoPago: this.idPago,
      idPagoBitacora: this.registroPago.idPagoBitacora,
      idRegistro: this.registroPago.idRegistro,
      importePago: this.registroPago.importePago,
      importeRegistro: this.tipoPagoForm.get('importe')?.value,
      numAutorizacion: this.tipoPagoForm.get('noAutorizacion')?.value
    }
  }

  get pf() {
    return this.tipoPagoForm?.errors
  }
}
