import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudPago} from "../../models/solicitud-pagos.interface";
import {SolicitudesPagoService} from "../../services/solicitudes-pago.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {Router} from "@angular/router";

interface SolicitudRechazo {
  idSolicitud: number,
  motivo: string
}

@Component({
  selector: 'app-rechazar-solicitud-pago',
  templateUrl: './rechazar-solicitud-pago.component.html',
  styleUrls: ['./rechazar-solicitud-pago.component.scss']
})
export class RechazarSolicitudPagoComponent implements OnInit {

  rechazarPagoForm!: FormGroup;
  pagoSeleccionado!: SolicitudPago;

  mensajeConfirmacion: boolean = false;

  constructor(
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private router: Router,
  ) {
  }


  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data;
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.rechazarPagoForm = this.formBulder.group({
      motivoRechazo: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
    });
  }

  confirmarRechazoPago(): void {
    this.cargadorService.activar();
    const solicitud: SolicitudRechazo = this.generarSolicitud();
    this.solicitudesPagoService.rechazarSolicitudPago(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'La solicitud de pago ha sido rechazada exitosamente.');
        this.referencia.close();
        this.actualizarPagina();
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

  generarSolicitud(): SolicitudRechazo {
    return {
      idSolicitud: this.pagoSeleccionado.idSolicitud,
      motivo: this.rechazarPagoForm.get('motivoRechazo')?.value
    }
  }


  get ref() {
    return this.rechazarPagoForm.controls;
  }

  actualizarPagina(): void {
    const currentUrl: string = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      void this.router.navigate([currentUrl]);
    });
  }

}
