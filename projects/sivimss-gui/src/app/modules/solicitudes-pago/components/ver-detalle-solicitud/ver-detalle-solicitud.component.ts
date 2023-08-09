import {Component, OnInit} from '@angular/core';
import { DetalleSolicitudPago, PartidaPresupuestal } from '../../models/solicitud-pagos.interface';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";
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

  convertirImporte(importe: string): void {
    if (!importe) return;
    const importeLetra: string = convertirNumeroPalabra(+importe);
    this.solicitudPagoSeleccionado.cantidadLetra=importeLetra;
  }

}
