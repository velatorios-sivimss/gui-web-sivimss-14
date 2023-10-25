import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {DetalleSolicitudPago, PartidaPresupuestal} from "../../models/solicitud-pagos.interface";
import {SolicitudesPagoService} from "../../services/solicitudes-pago.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";
import {forkJoin, Observable} from "rxjs";

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

  readonly CAPTURA_RECHAZAR_PAGO: number = 1;
  readonly RESUMEN_RECHAZAR_PAGO: number = 2;

  rechazarPagoForm!: FormGroup;
  pagoSeleccionado!: DetalleSolicitudPago;

  pasoRechazarPago: number = 1;
  motivoRechazo: string = '';

  partidaPresupuestal: PartidaPresupuestal [] = [];

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
      this.obtenerSolicPago(this.pagoSeleccionado.idSolicitud);
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.rechazarPagoForm = this.formBulder.group({
      motivoRechazo: [{value: null, disabled: false}, [Validators.maxLength(100), Validators.required]],
    });
  }

  obtenerSolicPago(idSolicitud: number): void {
    this.cargadorService.activar();
    this.solicitudesPagoService.detalleSolicitudPago(idSolicitud)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.pagoSeleccionado = respuesta.datos[0];
          this.listaPartidaPresupuestal(this.pagoSeleccionado.cveFolioGastos);
          this.partidaPresupuestalMultiplesFolios(this.pagoSeleccionado.foliosFactura);
          this.convertirImporte(this.pagoSeleccionado.impTotal);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  listaPartidaPresupuestal(folioGastos: string): void {
    if (!folioGastos) return;
    this.cargadorService.activar();
    this.solicitudesPagoService.buscarPartidaPresupuestal(folioGastos)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.partidaPresupuestal = respuesta.datos;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
        }
      });
  }

  partidaPresupuestalMultiplesFolios(foliosGastos: string): void {
    if (!foliosGastos) return;
    const folios: string[] = foliosGastos.split(',');
    const observablesFolios: Observable<HttpRespuesta<any>>[] = folios.map(folio => this.obtenerPartidaPresupuestal(folio.trim()));
    this.cargadorService.activar();
    forkJoin(observablesFolios).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta): void => {
        console.log(respuesta)
        this.partidaPresupuestal = respuesta.map(response => response.datos).flat();
      },
      error: (error): void => {
        console.error('Error:', error);
      }
    })
  }

  convertirImporte(importe: string): void {
    if (!importe) return;
    this.pagoSeleccionado.cantidadLetra = convertirNumeroPalabra(+importe);
  }

  aceptarRechazo(): void {
    this.pasoRechazarPago = this.RESUMEN_RECHAZAR_PAGO;
    this.motivoRechazo = this.rechazarPagoForm.get('motivoRechazo')?.value;
  }

  confirmarRechazoPago(): void {
    this.cargadorService.activar();
    const solicitud: SolicitudRechazo = this.generarSolicitud();
    this.solicitudesPagoService.rechazarSolicitudPago(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'La solicitud de pago ha sido rechazada exitosamente.');
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

  generarSolicitud(): SolicitudRechazo {
    return {
      idSolicitud: this.pagoSeleccionado.idSolicitud,
      motivo: this.rechazarPagoForm.get('motivoRechazo')?.value
    }
  }

  obtenerPartidaPresupuestal(parametro: string): Observable<any> {
    return this.solicitudesPagoService.buscarPartidaPresupuestal(parametro)
  }

  get ref() {
    return this.rechazarPagoForm.controls;
  }

  get tipoSolicitud(): number {
    return this.pagoSeleccionado.idTipoSolicitud;
  }

}
