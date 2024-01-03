import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudCrearPago} from "../../../modelos/solicitudPago.interface";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import * as moment from "moment";
import {DatosRegistroPago} from "../../../modelos/datosRegistro.interface";

@Component({
  selector: 'app-registrar-vale-paritaria',
  templateUrl: './registrar-vale-paritaria.component.html',
  styleUrls: ['./registrar-vale-paritaria.component.scss']
})
export class RegistrarValeParitariaComponent implements OnInit {

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoAgregarPago: number = 1;

  valeParitariaForm!: FormGroup;
  resumenSolicitud!: any;

  registroPago!: DatosRegistroPago;
  total: number = 0;
  totalFaltante: number = 0;

  constructor(private formBuilder: FormBuilder,
              public config: DynamicDialogConfig,
              public ref: DynamicDialogRef,
              private realizarPagoService: RealizarPagoService,
              private alertaService: AlertaService,
              private mensajesSistemaService: MensajesSistemaService,
  ) {
  }

  ngOnInit(): void {
    this.total = this.config.data.total;
    this.totalFaltante = this.config.data.totalPendiente;
    this.registroPago = this.config.data.datosRegistro;
    this.inicializarValeForm();
  }

  inicializarValeForm(): void {
    this.valeParitariaForm = this.formBuilder.group({
      total: [{value: this.totalFaltante, disabled: true}],
      numAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      fechaValeAGF: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  aceptar(): void {
    this.resumenSolicitud = this.valeParitariaForm.getRawValue();
    this.pasoAgregarPago = this.RESUMEN_DE_PAGO;
  }

  cancelar(): void {
    this.ref.close();
  }

  guardar(): void {
    const solicitudPago: SolicitudCrearPago = this.generarSolicitudPago();
    this.realizarPagoService.guardar(solicitudPago).subscribe({
      next: (): void => this.manejoRespuestaExitosaPago(),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaExitosaPago(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Pago registrado correctamente');
    this.ref.close();
    this.actualizarPagina();
  }

  private manejoRespuestaErrorPago(error: HttpErrorResponse): void {
    const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
    console.log(error);
  }

  generarSolicitudPago(): SolicitudCrearPago {
    const fechaValeAGF: string | null = this.obtenerFechaValeAGF();
    return {
      descBanco: '',
      fechaPago: null,
      fechaValeAGF: fechaValeAGF,
      idFlujoPago: this.registroPago.idFlujoPago,
      idMetodoPago: 1,
      idPagoBitacora: this.registroPago.idPagoBitacora,
      idRegistro: this.registroPago.idRegistro,
      importePago: this.valeParitariaForm.get('importe')?.value,
      importeRegistro: this.total,
      numAutorizacion: this.valeParitariaForm.get('numAutorizacion')?.value
    }
  }

  obtenerFechaValeAGF(): string | null {
    const fechaValeAGF = this.valeParitariaForm.get('fechaValeAGF')?.value;
    return fechaValeAGF ? moment(fechaValeAGF).format('YYYY-MM-DD') : null;
  }

  actualizarPagina(): void {
    window.location.reload();
  }

  get pf() {
    return this.valeParitariaForm?.controls
  }
}
