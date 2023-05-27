import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GenerarFormatoPagareService} from "../../services/generar-formato-pagare.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";

interface FormatoPagare {
  "folioODS": string,
  "fechaODS": string,
  "hora": string,
  "nomAgente": string,
  "domContratante":string,
  "fechaPago": string,
  "fechaPagare": string,
  "importe": number,
  "redito": string,
  "nomContratante": string,
  "folioPagare": string,
  "cantidad": string,
  "nomUsuario": string,
  "tipoReporte": string
}

@Component({
  selector: 'app-recibo-formato-pagare',
  templateUrl: './recibo-formato-pagare.component.html',
  styleUrls: ['./recibo-formato-pagare.component.scss'],
})
export class ReciboFormatoPagareComponent implements OnInit {

  formatoPagare!: FormatoPagare;
  importeLetra: string = "";

  constructor(
    private router: Router,
    private generarFormatoPagareService: GenerarFormatoPagareService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService
  ) {
    const idODS: number = this.router.getCurrentNavigation()?.extractedUrl.queryParams?.idODS;
    this.obtenerValoresPagare(idODS);
  }

  ngOnInit(): void {

  }

  obtenerValoresPagare(idODS: number): void {
    this.cargadorService.activar();
    this.generarFormatoPagareService.buscarDatosPagare(idODS).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (response) => {
        if (response.datos.length === 0) return;
        this.formatoPagare = response.datos[0];
        this.formatoPagare.tipoReporte = "pdf";
        this.obtenerImporteLetra(this.formatoPagare.importe);
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    );
  }

  
  obtenerImporteLetra(importe: number): void {
    this.cargadorService.activar();
    this.generarFormatoPagareService.obtenerImporteLetra(importe).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (response) => {
        this.importeLetra = response!.datos;
        this.formatoPagare.cantidad = response!.datos;
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    );
  }

  crearNuevoPagare(): any {
    return {
      importe : this.formatoPagare.importe,
      redito: this.formatoPagare.redito
    };
  }

  agregarPagare(): void {
    const pagare: FormatoPagare = this.crearNuevoPagare();
    const crearPagare: string = JSON.stringify(pagare);
    this.generarFormatoPagareService.guardar(crearPagare).subscribe(
      () => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Alta satisfactoria');
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta');
        console.error("ERROR: ", error.message)
      }
    );
  }

  generarPdf(): void {
    this.cargadorService.activar();
    this.generarFormatoPagareService.descargarFormato(this.formatoPagare).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        const downloadURL = window.URL.createObjectURL(respuesta);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `formatoPagare.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.agregarPagare();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
      }
    });
  }


}
