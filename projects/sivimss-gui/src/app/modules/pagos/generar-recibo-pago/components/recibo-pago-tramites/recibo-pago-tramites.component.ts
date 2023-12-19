import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from "../../../../../utils/funciones";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ReciboPagoTramites} from "../../models/ReciboPagoTramites.interface";
import * as moment from "moment/moment";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {VistaPreviaReciboPago} from "../../models/vistaPreviaReciboPago.interface";
import {SolicitudReciboPago} from "../../models/solicitudReciboPago.interface";

@Component({
  selector: 'app-recibo-pago-tramites',
  templateUrl: './recibo-pago-tramites.component.html',
  styleUrls: ['./recibo-pago-tramites.component.scss'],
})
export class ReciboPagoTramitesComponent implements OnInit {

  totalDerecho: number = 0;
  totalTramite: number = 0;

  recibo!: ReciboPagoTramites;
  mes: string = '';
  dia: string = '';
  anio: string = '';
  catalogoTramites: TipoDropdown[] = [];
  catalogoDerechos: TipoDropdown[] = [];

  idBitacoraPago!: number;
  FormReciboPago!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private generarReciboService: GenerarReciboService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertaService: AlertaService,
  ) {
    this.obtenerCatalogos();
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  obtenerCatalogos(): void {
    this.recibo = this.route.snapshot.data["respuesta"].datos[0];
    this.obtenerCatalogosPorVelatorio();
    this.idBitacoraPago = this.route.snapshot.params['idPagoBitacora'];
  }

  obtenerValoresFecha(): void {
    const fecha: Date = this.FormReciboPago.get('fechaTramite')?.value;
    this.dia = fecha.getDate().toString();
    this.mes = fecha.toLocaleString('default', {month: 'long'});
    this.anio = fecha.getFullYear().toString();
  }

  generarRecibo(): void {
    this.cargadorService.activar();
    const solicitudGuardar: SolicitudReciboPago = this.generarSolicitudGuardarReporte();
    this.generarReciboService.guardar(solicitudGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => this.mostrarMensajeCorrectoRecibo(),
      error: (error: HttpErrorResponse): void => this.mostrarMensajeErrorRecibo(error)
    });
  }

  mostrarMensajeCorrectoRecibo(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Recibo generado exitosamente.')
    void this.router.navigate(['../../'], {relativeTo: this.route});
  }

  mostrarMensajeErrorRecibo(error: HttpErrorResponse): void {
    console.error(error);
    const ERROR: string = "Error al guardar la información del Recibo de Pago. Intenta nuevamente.";
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
  }

  generarSolicitudGuardarReporte(): SolicitudReciboPago {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    const descripcionTramite = this.catalogoTramites.find(t => (t.value === tramite))?.value;
    const derecho = this.FormReciboPago.get('derecho')?.value;
    const descripcionDerecho = this.catalogoDerechos.find(t => (t.value === derecho))?.value;
    const total = this.FormReciboPago.get('total')?.value || 0;
    return {
      numFolio: this.recibo.claveFolio,
      idDelegacion: this.recibo.idDelegacion,
      idVelatorio: this.recibo.idVelatorio,
      idPagoDetalle: this.idBitacoraPago,
      fecReciboPago: moment(new Date()).format('YYYY-MM-DD HH:mm'),
      nomContratante: this.recibo.recibimos,
      canReciboPago: `${this.convertirMoneda(+this.recibo.cantidad)} (${this.recibo.cantidadLetra})`,
      canTramites: this.convertirMoneda(this.totalTramite),
      descTramites: descripcionTramite ?? '',
      canDerechos: this.convertirMoneda(this.totalDerecho),
      descDerechos: descripcionDerecho ?? '',
      canSuma: this.convertirMoneda(this.totalServicios),
      canTotal: this.convertirMoneda(total),
      agenteFuneMat: "",
      recibeMat: ""
    }
  }

  obtenerCatalogosPorVelatorio(): void {
    if (validarUsuarioLogueado()) return;
    const idVelatorio: string = this.recibo.idVelatorio.toString();
    const $tramites: Observable<HttpRespuesta<any>> = this.generarReciboService.obtenerCatalogoTramites(idVelatorio);
    const $derechos: Observable<HttpRespuesta<any>> = this.generarReciboService.obtenerCatalogoDerechos(idVelatorio);
    forkJoin([$tramites, $derechos]).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]): void => this.obtenerCatalogosTramitesDerechos(respuesta)
    });
  }

  obtenerCatalogosTramitesDerechos(respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]): void {
    const POSICION_TRAMITES: number = 0;
    const POSICION_DERECHOS: number = 1;
    const tramites = respuesta[POSICION_TRAMITES].datos;
    const derechos = respuesta[POSICION_DERECHOS].datos;
    this.catalogoTramites = mapearArregloTipoDropdown(tramites, "desTramite", "importe");
    this.catalogoDerechos = mapearArregloTipoDropdown(derechos, "desDerecho", "importe");
  }

  inicializarForm(): void {
    this.FormReciboPago = this.formBuilder.group({
      tramite: [{value: null, disable: false}, [Validators.required]],
      fechaTramite: [{value: null, disable: true}, [Validators.required]],
      descripcionTramite: [{value: null, disabled: true}],
      derecho: [{value: null, disable: false}, [Validators.required]],
      descripcionDerecho: [{value: null, disabled: true}],
      total: [{value: null, disabled: false}]
    });
    this.FormReciboPago.get('fechaTramite')?.patchValue(new Date(this.diferenciaUTC(this.recibo.fecha, '-')));
    this.obtenerValoresFecha();
  }

  cambiarTramite(): void {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    this.totalTramite = +tramite;
    this.FormReciboPago.get('descripcionTramite')?.patchValue(tramite);
  }

  cambiarDerechos(): void {
    const derecho = this.FormReciboPago.get('derecho')?.value;
    this.totalDerecho = +derecho;
    this.FormReciboPago.get('descripcionDerecho')?.patchValue(derecho);
  }

  generarVistaPrevia(): void {
    const solicitud: VistaPreviaReciboPago = this.generarSolicitudVistaPrevia();
    this.cargadorService.activar();
    this.generarReciboService.descargarReporte(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: any): void => this.mostrarVistaPrevia(respuesta),
      error: (error: HttpErrorResponse): void => this.mostrarMensajeErrorVistaPrevia(error)
    });
  }

  mostrarVistaPrevia(respuesta: any): void {
    const file: Blob = new Blob([respuesta], {type: 'application/pdf'});
    const url: string = window.URL.createObjectURL(file);
    window.open(url);
  }

  mostrarMensajeErrorVistaPrevia(error: HttpErrorResponse): void {
    console.error(error);
    const ERROR: string = "Error al mostrarla información del Recibo de Pago. Intenta nuevamente.";
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
  }

  generarSolicitudVistaPrevia(): VistaPreviaReciboPago {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    const descripcionTramite = this.catalogoTramites.find(t => (t.value === tramite))?.label;
    const derecho = this.FormReciboPago.get('derecho')?.value;
    const descripcionDerecho = this.catalogoDerechos.find(t => (t.value === derecho))?.label;
    const total = this.FormReciboPago.get('total')?.value || 0;
    return {
      folio: "XXXXXX",
      delegacion: this.recibo.delegacion,
      velatorio: this.recibo.velatorio,
      lugar: this.recibo.lugar,
      fecha: `${this.dia} de ${this.colocarTitleCase(this.mes)} del ${this.anio}`,
      recibimos: this.recibo.recibimos,
      cantidad: `${this.convertirMoneda(+this.recibo.cantidad)} (${this.recibo.cantidadLetra})`,
      tramites: this.convertirMoneda(this.totalTramite),
      descTramites: descripcionTramite ?? '',
      derechos: this.convertirMoneda(this.totalDerecho),
      descDerechos: descripcionDerecho ?? '',
      total: this.convertirMoneda(this.totalServicios),
      totalFinal: this.convertirMoneda(total),
      rutaNombreReporte: "reportes/plantilla/DetalleRecPagos.jrxml",
      tipoReporte: "pdf",
      folioPF: this.recibo.claveFolio
    }
  }

  colocarTitleCase(cadena: string): string {
    return cadena.split(" ").map((l: string) => l[0].toUpperCase() + l.substring(1)).join(" ");
  }

  convertirMoneda(valor: number): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
    return formatter.format(valor);
  }

  diferenciaUTC(fecha: string, divisor: string = "/"): number {
    const [anio, mes, dia]: string[] = fecha.split(divisor);
    const objetoFecha: Date = new Date(+anio, +mes - 1, +dia);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }

  get totalServicios() {
    return this.totalTramite + this.totalDerecho;
  }

  get f() {
    return this.FormReciboPago?.controls;
  }

}
