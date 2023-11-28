import {AfterContentChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DetalleSolicitudPago, PartidaPresupuestal} from '../../models/solicitud-pagos.interface';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {forkJoin, Observable} from "rxjs";

@Component({
  selector: 'app-ver-detalle-solicitud',
  templateUrl: './ver-detalle-solicitud.component.html',
  styleUrls: ['./ver-detalle-solicitud.component.scss']
})
export class VerDetalleSolicitudPagoComponent implements OnInit, AfterContentChecked {

  solicitudPagoSeleccionado!: DetalleSolicitudPago;
  idSolicitud!: number;
  partidaPresupuestal: PartidaPresupuestal [] = [];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.idSolicitud = this.config.data;
    this.obtenerSolicPago(this.idSolicitud);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  aceptar(): void {
    this.ref.close();
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoSeleccionado.idTipoSolicitud;
  }

  obtenerSolicPago(idSolicitud: number): void {

    this.solicitudesPagoService.detalleSolicitudPago(idSolicitud)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.solicitudPagoSeleccionado = respuesta.datos[0];
          const {cveFolioGastos, foliosFactura, impTotal} = this.solicitudPagoSeleccionado;
          this.listaPartidaPresupuestal(cveFolioGastos);
          this.partidaPresupuestalMultiplesFolios(foliosFactura);
          this.convertirImporte(impTotal);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  listaPartidaPresupuestal(folioGastos: string): void {
    if (!folioGastos) return;
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
    forkJoin(observablesFolios).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta): void => {
        this.partidaPresupuestal = respuesta.map(response => response.datos).flat();
      },
      error: (error): void => {
        console.error('Error:', error);
      }
    })
  }

  convertirImporte(importe: string): void {
    if (!importe) return;
    this.solicitudPagoSeleccionado.cantidadLetra = convertirNumeroPalabra(+importe);
  }

  obtenerPartidaPresupuestal(parametro: string): Observable<any> {
    return this.solicitudesPagoService.buscarPartidaPresupuestal(parametro)
  }

}
