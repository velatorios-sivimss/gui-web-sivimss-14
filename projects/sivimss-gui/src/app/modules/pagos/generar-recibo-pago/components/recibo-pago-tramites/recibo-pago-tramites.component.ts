import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GenerarReciboService} from "../../services/generar-recibo-pago.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";

interface RecPago {
  "descTramites": string,
  "rutaNombreReporte": string,
  "tramites": string,
  "velatorio": string,
  "lugar": string,
  "derechos": string,
  "recibimos": string,
  "fecha": string,
  "descDerechos": string,
  "total": string,
  "delegacion": string,
  "tipoReporte": string,
  "folio": string,
  "cantidad": string,
  "totalFinal": string
}

@Component({
  selector: 'app-recibo-pago-tramites',
  templateUrl: './recibo-pago-tramites.component.html',
  styleUrls: ['./recibo-pago-tramites.component.scss'],
})
export class ReciboPagoTramitesComponent implements OnInit {

  recibo!: RecPago;

  constructor(
    private router: Router,
    private generarReciboService: GenerarReciboService,
    private cargadorService: LoaderService,
  ) {
    const idBitacora: string = this.router.getCurrentNavigation()?.extractedUrl.queryParams?.idBitacora;
    this.obtenerValoresRec(+idBitacora);
  }

  ngOnInit(): void {

  }

  obtenerValoresRec(bitacora: number): void {
    this.cargadorService.activar();
    this.generarReciboService.buscarDatosReportePagos(bitacora).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (response) => {
        if (response.datos.length === 0) return;
        this.recibo = response.datos[0]
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    );
  }

  generarPdf(): void {
    this.cargadorService.activar();
    this.generarReciboService.descargarReporte(this.recibo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        const downloadURL = window.URL.createObjectURL(respuesta);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `reporte.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
      }
    });
  }


}
