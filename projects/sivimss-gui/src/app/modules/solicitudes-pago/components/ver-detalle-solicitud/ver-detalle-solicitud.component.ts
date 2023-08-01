import {Component, OnInit} from '@angular/core';
import { DetalleSolicitudPago, PartidaPresupuestal } from '../../models/solicitud-pagos.interface';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

type DetalleSolicPago = Required<DetalleSolicitudPago> & { id: string }

@Component({
  selector: 'app-ver-detalle-solicitud',
  templateUrl: './ver-detalle-solicitud.component.html',
  styleUrls: ['./ver-detalle-solicitud.component.scss']
})
export class VerDetalleSolicitudPagoComponent implements OnInit {

  solicitarSolicitudPago: DetalleSolicitudPago[] = [];
  solicitudPagoSeleccionado!: DetalleSolicitudPago;
  idSolicitud!: number;
  partidaPresupuestal: PartidaPresupuestal [] = [];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.idSolicitud = this.config.data;
    this.obtenerSolicPago(this.idSolicitud);
    /*
    this.partidaPresupuestal = [
      {
        idPartida: 1,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      },
      {
        idPartida: 2,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      }
    ];*/
  }

  aceptar(): void {
    this.ref.close();
  }

  abrirModalAceptar(): void {
    this.ref.close();
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoSeleccionado.idTipoSolicitud;
  }

  obtenerSolicPago(idSolicitud: number): void {
    this.cargadorService.activar();
    this.solicitudesPagoService.detalleSolicitudPago(idSolicitud)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.solicitudPagoSeleccionado = respuesta.datos[0];
          this.listaPartidaPresupuestal(this.solicitudPagoSeleccionado.cveFolioGastos);
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
      .subscribe(
        (respuesta) => {
          this.partidaPresupuestal = respuesta!.datos.content;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }


}
