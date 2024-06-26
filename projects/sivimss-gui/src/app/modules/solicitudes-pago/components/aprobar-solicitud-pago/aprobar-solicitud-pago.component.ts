import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {DetalleSolicitudPago, PartidaPresupuestal} from "../../models/solicitud-pagos.interface";
import {SolicitudesPagoService} from "../../services/solicitudes-pago.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

interface SolicitudCancelacion {
  idSolicitud: number
}

@Component({
  selector: 'app-aprobar-solicitud-pago',
  templateUrl: './aprobar-solicitud-pago.component.html',
  styleUrls: ['./aprobar-solicitud-pago.component.scss']
})
export class AprobarSolicitudPagoComponent implements OnInit {

  aprobarPagoForm!: FormGroup;
  solicitudPagoSeleccionado!: DetalleSolicitudPago;
  partidaPresupuestal: PartidaPresupuestal [] = [];
  mensajeConfirmacion: boolean = false;

  constructor(
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.solicitudPagoSeleccionado = this.config.data;
      this.obtenerSolicPago(this.solicitudPagoSeleccionado.idSolicitud);
    }
    this.inicializarAprobarPagoForm();
  }

  inicializarAprobarPagoForm(): void {
    this.aprobarPagoForm = this.formBulder.group({
      cveFolioGastos: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
    });
  }

  obtenerSolicPago(idSolicitud: number): void {
    this.cargadorService.activar();
    this.solicitudesPagoService.detalleSolicitudPago(idSolicitud)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.solicitudPagoSeleccionado = respuesta.datos[0];
          this.listaPartidaPresupuestal(this.solicitudPagoSeleccionado.cveFolioGastos);
          this.convertirImporte(this.solicitudPagoSeleccionado.impTotal);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  listaPartidaPresupuestal(folioGastos: string): void {
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

  get tipoSolicitud(): number {
    return this.solicitudPagoSeleccionado.idTipoSolicitud;
  }

  confirmarAprobacionPago(): void {
    this.cargadorService.activar();
    const solicitud: SolicitudCancelacion = this.generarSolicitud();
    this.solicitudesPagoService.aprobarSolicitudPago(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Tu solicitud de pago ha sido aprobada exitosamente.');
        this.referencia.close(true);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  generarSolicitud(): SolicitudCancelacion {
    return {
      idSolicitud: this.solicitudPagoSeleccionado.idSolicitud
    }
  }

  convertirImporte(importe: string): void {
    if (!importe) return;
    this.solicitudPagoSeleccionado.cantidadLetra = convertirNumeroPalabra(+importe);
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get ref() {
    return this.aprobarPagoForm.controls;
  }
}
