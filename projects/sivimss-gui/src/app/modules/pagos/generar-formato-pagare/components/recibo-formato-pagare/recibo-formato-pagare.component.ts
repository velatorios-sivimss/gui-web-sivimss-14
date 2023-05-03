import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GenerarFormatoPagareService} from "../../services/generar-formato-pagare.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";

interface FormatoPagare {
  "folioOds": string,
  "fechaOds": string,
  "hora": string,
  "folioPagare": string,
  "buenoPor": string,
  "ordenDia": string,
  "cantidad": string,
  "cantidadLetra": string,
  "porcentaje": string,
  "otorgante": string,
  "domicilio": string,
  "fecha": string,
  "agente": string,
  "rutaNombreReporte": string,
  "tipoReporte": string,
}

@Component({
  selector: 'app-recibo-formato-pagare',
  templateUrl: './recibo-formato-pagare.component.html',
  styleUrls: ['./recibo-formato-pagare.component.scss'],
})
export class ReciboFormatoPagareComponent implements OnInit {

  formatoPagare!: any;

  constructor(
    private router: Router,
    private generarFormatoPagareService: GenerarFormatoPagareService,
    private cargadorService: LoaderService,
  ) {
    const idBitacora: string = this.router.getCurrentNavigation()?.extractedUrl.queryParams?.idBitacora;
    this.obtenerValoresRec(+idBitacora);
  }

  ngOnInit(): void {

  }

  obtenerValoresRec(bitacora: number): void {
    this.formatoPagare  = {
        folioOds:"DOC-000001",
        fechaOds:"15/04/2023",
        hora:"10:32 am",
        folioPagare:"DOC-000001",
        buenoPor: "$35,000.00",
        nombreCliente: "INSTITUTO MEXICANO DEL SEGURO SOCIAL",
        ordenDia: "15/04/2023",
        cantidad:"$50,000.00",
        cantidadLetra:"(Cincuenta mil pesos)",
        porcentaje:"6.00",
        otorgante:"Raul De Jesus Arteaga Balbuena",
        domicilio:"Calle San Juan, Tapachula,Chiapas,Mx",
        fecha:"15/04/2023",
        agente:"Edwin Ruiz Cardenas",
        rutaNombreReporte:"reportes/plantilla/DetalleGenerarPagare.jrxml", 
        tipoReporte:"pdf"
      };
    
    this.cargadorService.activar();
    this.generarFormatoPagareService.buscarDatosReportePagos(bitacora).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (response) => {
        if (response.datos.length === 0) return;
       // this.formatoPagare = response.datos[0]
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    );
  }

  generarPdf(): void {
    this.cargadorService.activar();
    this.generarFormatoPagareService.descargarReporte(this.formatoPagare).pipe(
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
