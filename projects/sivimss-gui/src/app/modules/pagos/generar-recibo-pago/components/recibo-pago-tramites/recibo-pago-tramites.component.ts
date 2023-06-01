import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {validarUsuarioLogueado} from "../../../../../utils/funciones";
import {ReciboPagoTramites} from "../../models/ReciboPagoTramites.interface";

@Component({
  selector: 'app-recibo-pago-tramites',
  templateUrl: './recibo-pago-tramites.component.html',
  styleUrls: ['./recibo-pago-tramites.component.scss'],
})
export class ReciboPagoTramitesComponent implements OnInit {

  recibo!: ReciboPagoTramites;

  constructor(
    private router: Router,
    private generarReciboService: GenerarReciboService,
    private cargadorService: LoaderService,
  ) {
    const idPagoBitacora: string = this.router.getCurrentNavigation()?.extractedUrl.queryParams?.idPagoBitacora;
    this.obtenerValoresRec(+idPagoBitacora);
  }

  ngOnInit(): void {
  }

  obtenerValoresRec(bitacora: number): void {
    if (validarUsuarioLogueado()) return;
    this.cargadorService.activar();
    this.generarReciboService.buscarDatosReportePagos(bitacora).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (response: HttpRespuesta<any>): void => {
        if (response.datos.length === 0) return;
        this.recibo = response.datos[0];
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error)
      }
    });
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


}
