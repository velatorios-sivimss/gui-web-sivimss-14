import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {ReciboPagoTramites} from "../../models/ReciboPagoTramites.interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {forkJoin} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from "../../../../../utils/funciones";
import {FormBuilder, FormGroup} from "@angular/forms";

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
    private cargadorService: LoaderService,
    private formBuilder: FormBuilder,
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
    this.dia = fecha.getDay().toString();
    this.mes = fecha.toLocaleString('default', {month: 'long'});
    this.anio = fecha.getFullYear().toString();
  }

  generarPdf(): void {
    this.cargadorService.activar();
    this.generarReciboService.descargarReporte(this.recibo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: Blob): void => {
        const downloadURL: string = window.URL.createObjectURL(respuesta);
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = downloadURL;
        link.download = `reporte.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error)
      }
    });
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
      tramite: [{value: null, disable: false}],
      descripcionTramite: [{value: null, disabled: true}],
      derecho: [{value: null, disable: false}],
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

  get totalServicios() {
    return this.totalTramite + this.totalDerecho;
  }

  get total() {
    return this.totalTramite + this.totalDerecho - +this.recibo.cantidad;
  }

}
