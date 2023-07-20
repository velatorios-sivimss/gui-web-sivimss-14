import {Component, OnInit} from '@angular/core';
import { SolicitarSolicitudPago, PartidaPresupuestal } from '../../models/solicitud-pagos.interface';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

type DetalleSolicPago = Required<SolicitarSolicitudPago> & { id: string }

@Component({
  selector: 'app-ver-detalle-solicitud',
  templateUrl: './ver-detalle-solicitud.component.html',
  styleUrls: ['./ver-detalle-solicitud.component.scss']
})
export class VerDetalleSolicitudPagoComponent implements OnInit {

  solicitarSolicitudPago: SolicitarSolicitudPago[] = [];
  solicitudPagoSeleccionado!: SolicitarSolicitudPago;
  idSolicitud!: number;
  partidaPresupuestal: PartidaPresupuestal [] = [];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.idSolicitud = this.config.data;
    this.obtenerSolicPago(this.idSolicitud);
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
    ];
  }
 
  aceptar(): void {
    this.ref.close();
  }

  abrirModalAceptar(): void {
    this.ref.close();
  }

  obtenerSolicPago(idSolicitud: number): void {
    this.cargadorService.activar();
    this.solicitudesPagoService.detalleSolicitudPago(idSolicitud)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.solicitudPagoSeleccionado = respuesta.datos[0];
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });

  }
}
