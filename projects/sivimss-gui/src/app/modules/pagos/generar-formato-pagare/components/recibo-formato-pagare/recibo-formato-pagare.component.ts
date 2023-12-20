import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GenerarFormatoPagareService} from "../../services/generar-formato-pagare.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {FormBuilder, FormGroup} from '@angular/forms';
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {FormatoPagare} from '../../models/formato-pagare.interface';
import {Location} from "@angular/common";

@Component({
  selector: 'app-recibo-formato-pagare',
  templateUrl: './recibo-formato-pagare.component.html',
  styleUrls: ['./recibo-formato-pagare.component.scss'],
})
export class ReciboFormatoPagareComponent {

  formatoPagare!: FormatoPagare;
  importeLetra: string = "";
  filtroForm!: FormGroup;

  fechaActual: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private generarFormatoPagareService: GenerarFormatoPagareService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private location: Location
  ) {
    this.formatoPagare = this.route.snapshot.data["respuesta"].datos[0];
    this.formatoPagare.idODS = this.route.snapshot.params.idODS;
    this.formatoPagare.tipoReporte = "pdf";
    this.formatoPagare.horaODS = this.formatoPagare.hora.slice(0, 5);
    this.formatoPagare.hora = this.formatoPagare.hora.slice(0, 5);
    this.obtenerImporteLetra(this.formatoPagare.importe);
    this.inicializarFiltroForm();
  }


  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      redito: [{value: this.formatoPagare.redito, disabled: false}],
    });
  }

  obtenerImporteLetra(importe: number): void {
    this.cargadorService.activar();
    this.generarFormatoPagareService.obtenerImporteLetra(importe).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response): void => {
        this.importeLetra = response.datos;
        this.formatoPagare.cantidad = response.datos;
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error)
      }
    });
  }

  crearNuevoPagare(): any {
    this.formatoPagare.redito = this.filtroForm.get("redito")?.value !== '' ? this.filtroForm.get("redito")?.value : 0;
    return {
      idODS: this.formatoPagare.idODS,
      importe: this.formatoPagare.importe,
      redito: this.formatoPagare.redito
    };
  }

  agregarPagare(): void {
    const pagare: FormatoPagare = this.crearNuevoPagare();
    const crearPagare: string = JSON.stringify(pagare);
    this.generarFormatoPagareService.guardar(crearPagare).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Agregado correctamente');
        this.regresarPaginaPrevia();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
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
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  generarVistaPrevia(): void {
    const solicitud: FormatoPagare = this.generarSolicitudVistaPrevia();
    this.cargadorService.activar();
    this.generarFormatoPagareService.descargarFormato(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (response: any): void => {
        const file: Blob = new Blob([response], {type: 'application/pdf'});
        const url: string = window.URL.createObjectURL(file);
        window.open(url);
      },
      error: (error: HttpErrorResponse): void => {
        console.error('Error al descargar reporte: ', error.message);
      }
    });
  }

  generarSolicitudVistaPrevia(): FormatoPagare {
    return {
      id: this.formatoPagare.id,
      idODS: this.formatoPagare.idODS,
      fechaODS: this.formatoPagare.fechaODS,
      folioODS: this.formatoPagare.folioODS,
      nomContratante: this.formatoPagare.nomContratante,
      horaODS: this.formatoPagare.hora,
      hora: this.formatoPagare.hora,
      nomAgente: this.formatoPagare.nomAgente,
      domContratante: this.formatoPagare.domContratante,
      fechaPago: this.formatoPagare.fechaPago,
      fechaPagare: this.formatoPagare.fechaPagare,
      importe: this.formatoPagare.importe,
      redito: this.formatoPagare.redito,
      folioPagare: this.formatoPagare.folioPagare,
      cantidad: this.importeLetra,
      nomUsuario: this.formatoPagare.nomUsuario,
      tipoReporte: "pdf"
    }
  }

  regresarPaginaPrevia(): void {
    this.location.back();
  }
}
