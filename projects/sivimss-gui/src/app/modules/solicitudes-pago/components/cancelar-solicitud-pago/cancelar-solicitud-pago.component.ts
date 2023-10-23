import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudPago} from "../../models/solicitud-pagos.interface";
import {SolicitudesPagoService} from "../../services/solicitudes-pago.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

interface SolicitudCancelacion {
  idSolicitud: number,
  motivo: string
}

@Component({
  selector: 'app-cancelar-solicitud-pago',
  templateUrl: './cancelar-solicitud-pago.component.html',
  styleUrls: ['./cancelar-solicitud-pago.component.scss']
})
export class CancelarSolicitudPagoComponent implements OnInit {

  readonly CAPTURA_CANCELAR_PAGO: number = 1;
  readonly RESUMEN_CANCELAR_PAGO: number = 2;

  cancelarPagoForm!: FormGroup;
  pagoSeleccionado!: SolicitudPago;

  motivoCancelacion: string = '';
  pasoCancelarPago: number = 1;

  constructor(
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
  ) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data;
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.cancelarPagoForm = this.formBulder.group({
      motivo: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
    });
  }

  aceptarCancelacion(): void {
    this.pasoCancelarPago = this.RESUMEN_CANCELAR_PAGO;
    this.motivoCancelacion = this.cancelarPagoForm.get('motivo')?.value;
  }

  confirmarCancelacionPago(): void {
    this.cargadorService.activar();
    const solicitud: SolicitudCancelacion = this.generarSolicitud();
    this.solicitudesPagoService.cancelarSolicitudPago(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Tu solicitud de pago ha sido cancelada exitosamente.');
        this.referencia.close(true);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  generarSolicitud(): SolicitudCancelacion {
    return {
      idSolicitud: this.pagoSeleccionado.idSolicitud,
      motivo: this.cancelarPagoForm.get('motivo')?.value
    }
  }

  get ref() {
    return this.cancelarPagoForm.controls;
  }


}
