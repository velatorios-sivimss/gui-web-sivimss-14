import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudCrearPago} from "../../modelos/solicitudPago.interface";

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
  resumenSolicitud!: any;

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    this.tipoPago = this.config.data.tipoPago;
    this.idPago = this.config.data.idPago;
    this.total = this.config.data.total;
    this.registroPago = this.config.data.datosRegistro;
    this.inicializarTipoPagoForm();
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

  aceptar(): void {
    this.resumenSolicitud = this.tipoPagoForm.getRawValue();
    this.pasoAgregarPago = this.RESUMEN_DE_PAGO;
  }

  guardar(): void {
    const solicitudPago: SolicitudCrearPago = this.generarSolicitudPago();
  }

  cancelar(): void {
    this.ref.close();
  }

  generarSolicitudPago(): SolicitudCrearPago {
    return {
      descBanco: this.tipoPagoForm.get('nombreBanco')?.value,
      fechaPago: this.tipoPagoForm.get('fecha')?.value,
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
