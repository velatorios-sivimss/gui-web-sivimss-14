import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GenerarFormatoPagareService} from "../../services/generar-formato-pagare.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {FormBuilder, FormGroup} from '@angular/forms';
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {FormatoPagare} from '../../models/formato-pagare.interface';

@Component({
  selector: 'app-recibo-formato-pagare',
  templateUrl: './recibo-formato-pagare.component.html',
  styleUrls: ['./recibo-formato-pagare.component.scss'],
})
export class ReciboFormatoPagareComponent implements OnInit {

  formatoPagare!: FormatoPagare;
  importeLetra: string = "";
  filtroForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private generarFormatoPagareService: GenerarFormatoPagareService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder
  ) {
    this.formatoPagare = this.route.snapshot.data["respuesta"].datos[0];
    this.formatoPagare.tipoReporte = "pdf";
    this.obtenerImporteLetra(this.formatoPagare.importe);
    this.inicializarFiltroForm();
  }

  ngOnInit(): void {
    
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      redito: [{ value: this.formatoPagare.redito, disabled: false }],
    });
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
      fechaODS:  this.formatoPagare.fechaODS,
      folioODS:  this.formatoPagare.folioODS,
      nomContratante:  this.formatoPagare.nomContratante,
      hora:  this.formatoPagare.hora,
      nomAgente:  this.formatoPagare.nomAgente,
      domContratante: this.formatoPagare.domContratante,
      fechaPago:  this.formatoPagare.fechaPago,
      fechaPagare:  this.formatoPagare.fechaPagare,
      importe: this.formatoPagare.importe,
      redito:  this.formatoPagare.redito,
      folioPagare:  this.formatoPagare.folioPagare,
      cantidad:  this.importeLetra,
      nomUsuario:  this.formatoPagare.nomUsuario,
      tipoReporte: "pdf"
    }
  }

}
