import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {forkJoin} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from "../../../../../utils/funciones";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ReciboPagoTramites} from "../../models/ReciboPagoTramites.interface";
import * as moment from "moment/moment";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";

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

  FormReciboPago!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private generarReciboService: GenerarReciboService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertaService: AlertaService
  ) {
    this.recibo = this.route.snapshot.data["respuesta"].datos[0];
    this.obtenerCatalogosPorVelatorio();
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.obtenerValoresFecha();
  }

  obtenerValoresFecha(): void {
    const fecha: Date = new Date();
    this.dia = fecha.getDate().toString();
    this.mes = fecha.toLocaleString('default', {month: 'long'});
    this.anio = fecha.getFullYear().toString();
  }

  generarRecibo(): void {
    this.cargadorService.activar();
    const solicitudGuardar = this.generarSolicitudGuardarReporte();
    this.generarReciboService.guardar(solicitudGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Recibo generado exitosamente.')
        void this.router.navigate(['../../'], {relativeTo: this.route});
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  generarSolicitudGuardarReporte() {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    const descripcionTramite = this.catalogoTramites.find(t => (t.value === tramite))?.value;
    const derecho = this.FormReciboPago.get('derecho')?.value;
    const descripcionDerecho = this.catalogoDerechos.find(t => (t.value === derecho))?.value;
    return {
      numFolio: this.recibo.claveFolio,
      idDelegacion: this.recibo.idDelegacion,
      idVelatorio: this.recibo.idVelatorio,
      idPagoDetalle: this.recibo.idPagoDetalle,
      fecReciboPago: moment(new Date()).format('YYYY-MM-DD HH:mm'),
      nomContratante: this.recibo.recibimos,
      canReciboPago: `${this.convertirMoneda(+this.recibo.cantidad)} (${this.recibo.cantidadLetra})`,
      canTramites: this.convertirMoneda(this.totalTramite),
      descTramites: descripcionTramite ?? '',
      canDerechos: this.convertirMoneda(this.totalDerecho),
      descDerechos: descripcionDerecho ?? '',
      canSuma: this.convertirMoneda(this.totalServicios),
      canTotal: this.convertirMoneda(this.total),
      agenteFuneMat: "",
      recibeMat: ""
    }
  }

  obtenerCatalogosPorVelatorio(): void {
    if (validarUsuarioLogueado()) return;
    const idVelatorio: string = this.recibo.idVelatorio.toString();
    const $tramites = this.generarReciboService.obtenerCatalogoTramites(idVelatorio);
    const $derechos = this.generarReciboService.obtenerCatalogoDerechos(idVelatorio);
    forkJoin([$tramites, $derechos]).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]): void => {
        const POSICION_TRAMITES: number = 0;
        const POSICION_DERECHOS: number = 1;
        const tramites = respuesta[POSICION_TRAMITES].datos;
        const derechos = respuesta[POSICION_DERECHOS].datos;
        this.catalogoTramites = mapearArregloTipoDropdown(tramites, "importe", "desTramite");
        this.catalogoDerechos = mapearArregloTipoDropdown(derechos, "importe", "desDerecho");
      }
    });
  }

  private inicializarForm(): void {
    this.FormReciboPago = this.formBuilder.group({
      tramite: [{value: null, disable: false}, [Validators.required]],
      descripcionTramite: [{value: null, disabled: true}],
      derecho: [{value: null, disable: false}, [Validators.required]],
      descripcionDerecho: [{value: null, disabled: true}]
    })
  }

  cambiarTramite(): void {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    const descripcion = this.catalogoTramites.find(t => (t.value === tramite))?.value;
    this.totalTramite = +this.catalogoTramites.find(t => (t.value === tramite))!.label;
    this.FormReciboPago.get('descripcionTramite')?.patchValue(descripcion);
  }

  cambiarDerechos(): void {
    const derecho = this.FormReciboPago.get('derecho')?.value;
    const descripcion = this.catalogoDerechos.find(t => (t.value === derecho))?.value;
    this.totalDerecho = +this.catalogoDerechos.find(t => (t.value === derecho))!.label;
    this.FormReciboPago.get('descripcionDerecho')?.patchValue(descripcion);
  }

  generarVistaPrevia(): void {
    const solicitud = this.generarSolicitudVistaPrevia();
    this.generarReciboService.descargarReporte(solicitud).subscribe(
      (response: any): void => {
        const file = new Blob([response], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(file);
        window.open(url);
      },
      (error: HttpErrorResponse): void => {
        console.error('Error al descargar reporte: ', error.message);
      }
    );
  }

  generarSolicitudVistaPrevia() {
    const tramite = this.FormReciboPago.get('tramite')?.value;
    const descripcionTramite = this.catalogoTramites.find(t => (t.value === tramite))?.value;
    const derecho = this.FormReciboPago.get('derecho')?.value;
    const descripcionDerecho = this.catalogoDerechos.find(t => (t.value === derecho))?.value;
    return {
      folio: "XXXXXX",
      delegacion: this.recibo.delegacion,
      velatorio: this.recibo.velatorio,
      lugar: "Mexico CDMX",
      fecha: `${this.dia} de ${this.colocarTitleCase(this.mes)} del ${this.anio}`,
      recibimos: this.recibo.recibimos,
      cantidad: `${this.convertirMoneda(+this.recibo.cantidad)} (${this.recibo.cantidadLetra})`,
      tramites: this.convertirMoneda(this.totalTramite),
      descTramites: descripcionTramite ?? '',
      derechos: this.convertirMoneda(this.totalDerecho),
      descDerechos: descripcionDerecho ?? '',
      total: this.convertirMoneda(this.totalServicios),
      totalFinal: this.convertirMoneda(this.total),
      rutaNombreReporte: "reportes/plantilla/DetalleRecPagos.jrxml",
      tipoReporte: "pdf"
    }
  }

  colocarTitleCase(cadena: string): string {
    return cadena.split(" ").map((l: string) => l[0].toUpperCase() + l.substr(1)).join(" ");
  }

  convertirMoneda(valor: number): string {
    const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
    return formatter.format(valor);
  }

  get totalServicios() {
    return this.totalTramite + this.totalDerecho;
  }

  get total() {
    return this.totalTramite + this.totalDerecho - +this.recibo.cantidad;
  }

  get f() {
    return this.FormReciboPago?.controls;
  }
}
