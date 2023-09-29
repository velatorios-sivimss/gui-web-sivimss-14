import {Component} from '@angular/core';
import {DetalleReciboPago} from "../../models/detalleReciboPago.interface";
import {ActivatedRoute} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {SolicitudReportePagoTramite} from "../../models/solicitudReporte.interface";
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {Observable} from "rxjs";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-detalle-pago-tramites',
  templateUrl: './detalle-pago-tramites.component.html',
  styleUrls: ['./detalle-pago-tramites.component.scss'],
  providers: [DescargaArchivosService]
})
export class DetallePagoTramitesComponent {

  recibo!: DetalleReciboPago
  mes: string = '';
  dia: string = '';
  anio: string = '';

  constructor(
    private route: ActivatedRoute,
    private generarReciboService: GenerarReciboService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService
  ) {
    this.recibo = this.route.snapshot.data["respuesta"].datos[0];
    this.obtenerValoresFecha();
  }


  obtenerValoresFecha(): void {
    const fecha: Date = new Date(this.diferenciaUTCGuion(this.recibo.fecha));
    this.dia = fecha.getDate().toString();
    this.mes = fecha.toLocaleString('default', {month: 'long'});
    this.anio = fecha.getFullYear().toString();
  }

  diferenciaUTCGuion(fecha: string): number {
    const [anio, mes, dia]: string[] = fecha.split("-");
    const objetoFecha: Date = new Date(+anio, +mes - 1, +dia);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }

  generarExcel(): void {
    const solicitud: SolicitudReportePagoTramite = this.generarSolicitudReporte('xls');
    this.cargadorService.activar();
    const servicio$: Observable<Blob> = this.generarReciboService.descargarReporte(solicitud);
    const opcionesArchivo: OpcionesArchivos = {nombreArchivo: 'reciboPago', ext: 'xlsx'}
    this.descargaArchivosService.descargarArchivo(servicio$, opcionesArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta): void => {
        console.log(respuesta)
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error)
      }
    });
  }

  generarPDF(): void {
    const solicitud: SolicitudReportePagoTramite = this.generarSolicitudReporte();
    this.cargadorService.activar();
    const servicio$: Observable<Blob> = this.generarReciboService.descargarReporte(solicitud);
    this.descargaArchivosService.descargarArchivo(servicio$, {nombreArchivo: 'reciboPago'}).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta): void => {
        console.log(respuesta)
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error)
      }
    });
  }

  generarSolicitudReporte(tipoReporte: string = "pdf"): SolicitudReportePagoTramite {
    return {
      folio: this.recibo.folio,
      delegacion: this.recibo.delegacion,
      velatorio: this.recibo.velatorio,
      lugar: "Mexico CDMX",
      fecha: `${this.dia} de ${this.colocarTitleCase(this.mes)} del ${this.anio}`,
      recibimos: this.recibo.recibimos,
      cantidad: this.recibo.cantidad,
      tramites: this.recibo.canTramites,
      descTramites: this.recibo.descTramites,
      derechos: this.recibo.canDerechos,
      descDerechos: this.recibo.descDerechos,
      total: this.recibo.canSuma,
      totalFinal: this.recibo.canTotal,
      rutaNombreReporte: this.recibo.rutaNombreReporte,
      tipoReporte: tipoReporte,
      folioPF: this.recibo.folioPF
    }
  }

  colocarTitleCase(cadena: string): string {
    return cadena.split(" ").map((l: string) => l[0].toUpperCase() + l.substring(1)).join(" ");
  }

}
