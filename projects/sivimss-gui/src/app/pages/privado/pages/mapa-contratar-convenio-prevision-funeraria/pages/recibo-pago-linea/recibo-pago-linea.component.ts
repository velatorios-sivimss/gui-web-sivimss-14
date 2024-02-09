import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {OpcionesArchivos} from "../../../../../../models/opciones-archivos.interface";
import {obtenerFechaYHoraActual} from "../../../../../../utils/funciones";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {DescargaArchivosService} from "../../../../../../services/descarga-archivos.service";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {
  BusquedaConveniosPFServic
} from "../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service";

interface RegistroRecibo {
  idPagoLinea: number,
  claveCliente: string,
  nomUsuario: string,
  numCon: string,
  conPago: string,
  impPagado: number,
  referencia: string,
  numAprobacion: string,
  folioPago: string,
  numTarjeta: string,
  emisorTarjeta: string,
  fecTransaccion: string,
  idDelegacion: number,
  nomDelegacion: string,
  idVelatorio: number,
  nomVelatorio: string
}

@Component({
  selector: 'app-recibo-pago-linea',
  templateUrl: './recibo-pago-linea.component.html',
  styleUrls: ['./recibo-pago-linea.component.scss'],
  providers: [DescargaArchivosService]
})
export class ReciboPagoLineaComponent implements OnInit {

  recibo!: RegistroRecibo;
  mostrarModalDescargaExitosa: boolean = false;

  constructor(private readonly activatedRoute: ActivatedRoute,
              private cargadorService: LoaderService,
              private descargaArchivosService: DescargaArchivosService,
              private alertaService: AlertaService,
              private mensajesSistemaService: MensajesSistemaService,
              private consultaConveniosService: BusquedaConveniosPFServic,
  ) {
  }

  ngOnInit(): void {
    this.recibo = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

  guardarPDF(): void {

    this.cargadorService.activar();
    const opciones: OpcionesArchivos = {nombreArchivo: `Comprobante pago ${obtenerFechaYHoraActual()}`};
    const folio = 1;
    this.descargaArchivosService.descargarArchivo(this.consultaConveniosService.descargar(folio), opciones).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => this.manejarMensajeDescargaExitosa(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeErrorDescarga(error),
    });
  }

  private manejarMensajeErrorDescarga(error: HttpErrorResponse): void {
    const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
    this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento. Intenta nuevamente.');
  }

  private manejarMensajeDescargaExitosa(respuesta: boolean): void {
    if (!respuesta) return;
    this.mostrarModalDescargaExitosa = !this.mostrarModalDescargaExitosa;
  }
}
