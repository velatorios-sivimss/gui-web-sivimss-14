import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { BusquedaConveniosPFServic } from './services/busqueda-convenios-pf.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LazyLoadEvent } from "primeng/api";
import { OverlayPanel } from 'primeng/overlaypanel';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { BusquedaPrevision } from './models/BusquedaPrevision.interface';
import { TransaccionPago } from "../../models/transaccion-pago.interface";
import { SolicitudPagos } from "../../models/solicitud-pagos.interface";
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import {GestorCredencialesService} from "../../../../services/gestor-credenciales.service";
@Component({
  selector: 'app-consulta-convenio-prevision-funeraria',
  templateUrl: './consulta-convenio-prevision-funeraria.component.html',
  styleUrls: ['./consulta-convenio-prevision-funeraria.component.scss'],
  providers: [GestorCredencialesService]
})
export class ConsultaConvenioPrevisionFunerariaComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  convenios: BusquedaPrevision[] = [];
  itemConvenio!: BusquedaPrevision;

  totalElementos: number = this.convenios.length;
  totalConveniosMostrados: number = 0;
  mostrarModalFaltaConvenio: boolean = false;
  mostrarModalNoPuedeRenovar: boolean = false;
  mostrarModalNoSeEncuentraEnPeriodo: boolean = false;
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  realizarPago: boolean = false;
  descargarConvenio: boolean = false;
  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  folioConvenio: string = '';
  idConvenioPf: number | null = null;
  idVelatorio: number | null = null;
  nombreCompleto: string = '';
  importe: number = 0;
  constructor(
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private renderer: Renderer2,
    private gestorCredencialesService: GestorCredencialesService
  ) { }
  ngOnInit(): void {
    // this.busqueda();
  }

  busqueda(): void {
    const valores = {
      pagina: this.numPaginaActual,
      tamanio: this.cantElementosPorPagina,
    };
    this.consultaConveniosService
      .consultarConvenios(valores)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
            return;
          }
          let total = respuesta.datos.length;
          if (total === 0 || respuesta.datos === null) {
            this.mostrarModalFaltaConvenio = true;
            return;
          }

          this.convenios = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements || 0;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);

          this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
        },
      });
  }

  paginar(event: LazyLoadEvent): void {
    // if (!validarAlMenosUnCampoConValor(valores)) return;
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    const valores = {
      pagina: this.numPaginaActual,
      tamanio: this.cantElementosPorPagina,
    };
    this.consultaConveniosService
      .consultarConvenios(valores)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
            return;
          }
          let total = respuesta.datos.content.length;
          if (total === 0 || respuesta.datos === null) {
            this.mostrarModalFaltaConvenio = true;
            return;
          }

          this.convenios = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);

          this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
        },
      });
  }


  cargarScript(callback: () => void): void {
    const elementoId: string = 'realizar-pago';
    if (!document.getElementById(elementoId)) {
      const body: HTMLElement = document.body;
      const elemento_ref = this.renderer.createElement('script');
      elemento_ref.type = 'text/javascript';
      elemento_ref.src = '../../../../assets/js/control-pagos.js';
      elemento_ref.id = elementoId;
      elemento_ref.async = true;
      elemento_ref.defer = true;
      this.renderer.appendChild(body, elemento_ref);
      elemento_ref.onload = callback;
    } else {
      callback();
    }
  }

  iniciarPago(): void {
    const elemento_ref = document.querySelector('.realizar-pago');
    const e = document.getElementById('btn-realizar-pago');
    if (!elemento_ref) return;
    this.overlayPanel.hide();
    elemento_ref.setAttribute('data-objeto', JSON.stringify({ referencia: 'NPF', monto: this.importe }));
    e?.click();
  }

  subscripcionMotorPagos(): void {
    // Escucha el evento personalizado
    document.addEventListener('datosRecibidos', (event) => {
      const data = (event as CustomEvent).detail;
      if (data.error && !data) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Error en la realización del pago en línea.');
        return;
      }
      if (data.transaction && [0, 1, 2, 3].includes(data.transaction.status_detail)) {
        this.guardarPagoEnLinea(data);
      }
      if (data.transaction && ![0, 1, 2, 3].includes(data.transaction.status_detail)) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Pago rechazado.');
      }
    });
  }

  guardarPagoEnLinea(transaccion: TransaccionPago): void {
    this.loaderService.activar();
    const solicitud: SolicitudPagos = this.generarSolicitudPagosLinea(transaccion);
    this.consultaConveniosService.guardarDatosPago(solicitud).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const id = respuesta.datos.idPagoLinea;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago realizado con éxito.');
        void this.router.navigate(['recibo-de-pago', id], { relativeTo: this.rutaActiva });
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    })
  }

  generarSolicitudPagosLinea(pago: TransaccionPago): SolicitudPagos {
    let idMetodoPago: number = 4;
    if (+pago.transaction.payment_method_type === 0) idMetodoPago = 4;
    if (+pago.transaction.payment_method_type === 7) idMetodoPago = 3;
    return {
      fecTransaccion: pago.transaction.payment_date, // pagos linea
      folio: this.folioConvenio,
      folioPago: "TEST-1", // pagos linea
      idFlujoPagos: 2,
      idMetodoPago, // debito o credito payment_method_type
      idRegistro: this.idConvenioPf, // idConvenio
      idVelatorio: this.idVelatorio,
      importe: this.importe,
      nomContratante: this.nombreCompleto,
      nomTitular: "Mario Dominguez Serrano", // pagos
      numAprobacion: pago.transaction.authorization_code, // pagos
      numTarjeta: pago.card.number, // pagos number
      referencia: pago.transaction.id // pagos transaction_reference
    }
  }

  abrirPanel(event: MouseEvent, itemConvenio: BusquedaPrevision): void {
    this.itemConvenio = itemConvenio;
    let idEstatus = itemConvenio.idEstatus;
    this.idConvenioPf = itemConvenio.idConvenio;
    this.idVelatorio = itemConvenio.idVelatorio;
    this.nombreCompleto = itemConvenio.nombreAfiliado;
    this.folioConvenio = itemConvenio.folioConvenio;
    this.importe = itemConvenio.precioPaquete;
    this.descargarConvenio = false;
    this.realizarPago = false;
    if (idEstatus == 2 || idEstatus == 4) {
      this.descargarConvenio = true;
    }
    if (idEstatus == 5) {
      this.realizarPago = true;
      this.gestorCredencialesService.obtenerToken().subscribe({
        next: (respuesta) => this.procesarToken(respuesta)
      });
    }
    this.overlayPanel.toggle(event);
  }

  procesarToken(respuesta: HttpRespuesta<any>): void {
    const [credenciales] = respuesta.datos;
    this.cargarScript(() => {});
    const elemento_ref = document.querySelector('.realizar-pago');
    if (!elemento_ref) return;
    elemento_ref.setAttribute('data-objeto', JSON.stringify({
      referencia: 'NPF',
      monto: this.importe,
      mode: credenciales.mode,
      code: credenciales.code,
      key: credenciales.key
    }));
    this.subscripcionMotorPagos();
  }

  verPlanPreFune(): void {
    void this.router.navigate(
      [
        'externo-privado/consultar-mi-convenio-de-prevision-funeraria/mi-convenio-de-prevision-funeraria',
      ],
      {
        queryParams: { idpfs: this.itemConvenio.idConvenio },
      }
    );
  }

  descargarDocumento(): void {
    this.loaderService.activar();
    const parametros = {
      tipoReporte: 'pdf',
      ciudadExpedicion: this.itemConvenio.ciudadExpedicion,
      fechaExpedicion: this.itemConvenio.fechaExpedicion,
      idConvenio: this.itemConvenio.idConvenio,
    };
    this.consultaConveniosService
      .descargarConvenio(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: any): void => {
          console.log(respuesta);
          const file = new Blob([respuesta], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(file);
          window.open(url);
        },
        error: (error: HttpErrorResponse): void => {
          this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
          console.log(error);
        },
      });
  }
}
