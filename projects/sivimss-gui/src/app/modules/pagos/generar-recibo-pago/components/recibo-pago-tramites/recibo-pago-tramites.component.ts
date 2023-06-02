import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {ReciboPagoTramites} from "../../models/ReciboPagoTramites.interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-recibo-pago-tramites',
  templateUrl: './recibo-pago-tramites.component.html',
  styleUrls: ['./recibo-pago-tramites.component.scss'],
})
export class ReciboPagoTramitesComponent implements OnInit {

  recibo!: ReciboPagoTramites;
  mes: string = '';
  dia: string = '';
  anio: string = '';
  catalogoTramites: TipoDropdown[] = [];
  tramites: any[] = [];
  catalogoDerechos: TipoDropdown[] = [];
  derechos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private generarReciboService: GenerarReciboService,
    private cargadorService: LoaderService,
  ) {
    this.recibo = this.route.snapshot.data["respuesta"].datos[0];
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
    const idVelatorio = '1';
    const $tramites = this.generarReciboService.obtenerCatalogoTramites(idVelatorio);
    const $derechos = this.generarReciboService.obtenerCatalogoDerechos(idVelatorio);
    forkJoin([$tramites, $derechos]).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>]): void => {
        console.log(respuesta);
      }
    });
  }


}
