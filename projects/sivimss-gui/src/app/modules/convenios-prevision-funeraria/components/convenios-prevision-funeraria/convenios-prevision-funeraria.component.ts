import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from "primeng/overlaypanel";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { LazyLoadEvent } from "primeng/api";
import { ConveniosPrevisionFunerariaInterface } from "../../models/convenios-prevision-funeraria.interface";
import { BeneficiarioInterface } from "../../models/beneficiario.interface";
import { AfiliadoInterface } from "../../models/afiliado.interface";
import { VigenciaConvenioInterface } from "../../models/vigencia-convenio.interface";
import { FacturaConvenioInterface } from "../../models/factura-convenio.interface";
import { SinisestroInterface } from "../../models/sinisestro.interface";
import { finalize } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { ConsultaConveniosService } from '../../services/consulta-convenios.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { FiltrosConvenio } from '../../models/filtros-convenio.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { DetalleConvenioPrevisionFunerariaComponent } from "../detalle-convenio-prevision-funeraria/detalle-convenio-prevision-funeraria.component";
import { Router } from '@angular/router';
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

@Component({
  selector: 'app-convenios-prevision-funeraria',
  templateUrl: './convenios-prevision-funeraria.component.html',
  styleUrls: ['./convenios-prevision-funeraria.component.scss'],
  providers: [DialogService]
})
export class ConsultaConveniosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;
  filtroSubForm!: FormGroup;
  archivoRef!: DynamicDialogRef;

  numPaginaActual = {
    tablaConvenios: 0,
    tablaAfiliados: 0,
    tablaVigenciaConvenio: 0,
    tablaFacturaConvenio: 0,
    tablaBeneficiario: 0,
    tablaSiniestros: 0,
  };
  totalElementos = {
    tablaConvenios: 0,
    tablaAfiliados: 0,
    tablaVigenciaConvenio: 0,
    tablaFacturaConvenio: 0,
    tablaBeneficiario: 0,
    tablaSiniestros: 0,
  };
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

  estatusConvenio: TipoDropdown[] = [
    {
      value: 1,
      label: 'Vigente'
    },
    {
      value: 2,
      label: 'Renovación'
    },
    {
      value: 3,
      label: 'Cerrado'
    },
  ]

  convenioPrevision: ConveniosPrevisionFunerariaInterface[] = [];
  datosAfiliado: AfiliadoInterface[] = [];
  vigenciaConvenio: VigenciaConvenioInterface[] = [];
  facturaConvenio: FacturaConvenioInterface[] = [];
  beneficiario: BeneficiarioInterface[] = [];
  siniestro: SinisestroInterface[] = [];

  convenioSeleccionado: ConveniosPrevisionFunerariaInterface = {};
  readonly ERROR_DESCARGA_ARCHIVO: string = "Error al guardar el archivo";

  detalleRef!: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private consultaConvenioService: ConsultaConveniosService,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      folioConvenio: [{ value: null, disabled: false }, Validators.maxLength(12)],
      rfc: [{ value: null, disabled: false }, Validators.maxLength(13)],
      nombre: [{ value: null, disabled: false }, Validators.maxLength(75)],
      curp: [{ value: null, disabled: false }, Validators.maxLength(18)],
      estatusConvenio: [{ value: null, disabled: false }]
    });

    this.filtroSubForm = this.formBuilder.group({
      folioConvenio: [{ value: null, disabled: false }, Validators.maxLength(12)],
      rfc: [{ value: null, disabled: false }, Validators.maxLength(13)],
      folioConvenioVigencia: [{ value: null, disabled: false }, Validators.maxLength(12)],
      numeroFactura: [{ value: null, disabled: false }, Validators.maxLength(12)],
      nombreBeneficiario: [{ value: null, disabled: false }, Validators.maxLength(75)],
      folioSiniestro: [{ value: null, disabled: false }, Validators.maxLength(12)],
    })
  }

  paginarConvenios(): void {
    this.cargadorService.activar();
    // this.consultaConvenioService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
    this.consultaConvenioService.buscarPorPagina(0, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          debugger;
          this.convenioPrevision = respuesta.datos?.content;
          this.totalElementos.tablaConvenios = respuesta.datos?.totalElements;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosConvenio = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    // this.consultaConvenioService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
    this.consultaConvenioService.buscarPorFiltros(filtros, 0, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.convenioPrevision = respuesta.datos?.content;
          this.totalElementos.tablaConvenios = respuesta.datos?.totalElements;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  crearSolicitudFiltros(): FiltrosConvenio {
    return {
      folioConvenio: this.filtroForm.get("folioConvenio")?.value,
      rfc: this.filtroForm.get("rfc")?.value,
      nombre: this.filtroForm.get("nombre")?.value,
      curp: this.filtroForm.get("curp")?.value,
      estatusConvenio: this.filtroForm.get("estatusConvenio")?.value
    }
  }

  paginar(event: LazyLoadEvent): void {
    const filtros: FiltrosConvenio = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.consultaConvenioService.buscarPorFiltros(filtros, 0, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if(respuesta.mensaje === "OK" && respuesta.datos) {
            // Seteamos los datos de cada seccion
            this.datosAfiliado = respuesta.datos.afiliados.datos.content;
            this.vigenciaConvenio = respuesta.datos.vigencias.datos.content;
            // this.facturaConvenio = respuesta.datos.facturas.datos.content; //Se comenta porque no existe funcionalidad actualmente
            this.beneficiario = respuesta.datos.beneficiarios.datos.content;
            this.siniestro = respuesta.datos.siniestros.datos.content;
            // Seteamos los datos de convenios
            this.convenioPrevision = respuesta.datos.convenios.datos.content;
            this.totalElementos.tablaConvenios = respuesta.datos.convenios.datos.totalElements;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  agregarConvenio(): void { }

  devolverBeneficiarios(beneficiario: BeneficiarioInterface[]): number {
    return beneficiario.length;
  }

  abrirModalDetalleConvenio(convenio: ConveniosPrevisionFunerariaInterface): void {
    this.detalleRef = this.dialogService.open(DetalleConvenioPrevisionFunerariaComponent, {
      header: "Detalle del convenio",
      width: "920px",
      data: convenio,
    })
  }

  buscar(): void {
    if (validarAlMenosUnCampoConValor(this.filtroForm.value)) {
      this.paginar_();
    } else {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Selecciona por favor un criterio de búsqueda.');
    }
  }

  paginar_(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual.tablaConvenios = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual.tablaConvenios = 0;
    }
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.consultaConvenioService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.mensaje === "OK" && respuesta.datos) {
          // Seteamos los datos de cada seccion
          this.datosAfiliado = respuesta.datos.afiliados.datos.content;
          this.vigenciaConvenio = respuesta.datos.vigencias.datos.content;
          // this.facturaConvenio = respuesta.datos.facturas.datos.content;
          this.beneficiario = respuesta.datos.beneficiarios.datos.content;
          this.siniestro = respuesta.datos.siniestros.datos.content;
          // Seteamos los datos de convenios
          this.convenioPrevision = respuesta.datos.convenios.datos.content;
          this.totalElementos.tablaConvenios = respuesta.datos.convenios.datos.totalElements;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  obtenerObjetoParaFiltrado(): any {
    return {
      ...this.filtroForm.value,
    };
  }

  cancelar(): void {
    this.router.navigate(["/"]).then(() => { }).catch(() => { });
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  abrirPanel(event: MouseEvent, convenio: ConveniosPrevisionFunerariaInterface): void {
    this.convenioSeleccionado = convenio;
    this.overlayPanel.toggle(event);
  }

  get ff() {
    return this.filtroForm.controls;
  }

  get fsf() {
    return this.filtroSubForm.controls;
  }

  guardarListadoPagaresPDF() {
    this.cargadorService.activar();
    this.descargaArchivosService.descargarArchivo(this.consultaConvenioService.descargarListadoPagaresPDF()).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        console.log(respuesta)
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      },
    });
  }

  guardarListadoPagaresExcel() {
    this.cargadorService.activar();
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: "reporte", ext: "xlsx" }
    this.descargaArchivosService.descargarArchivo(this.consultaConvenioService.descargarListadoPagaresExcel(),
      configuracionArchivo).pipe(
        finalize(() => this.cargadorService.desactivar())).subscribe({
          next: (respuesta: any) => {
            console.log(respuesta)
          },
          error: (error): void => {
            this.mensajesSistemaService.mostrarMensajeError(error.message, this.ERROR_DESCARGA_ARCHIVO);
            console.log(error)
          },
        })
  }

  realizarBusquedaSubForm(controlName: string) {
    this.fsf[controlName].patchValue(this.fsf[controlName].value.trim());
    if (this.fsf[controlName].value && this.fsf[controlName].value !== '') {
      switch (controlName) {
        case 'folioConvenio':
          this.buscarPorConvenio(this.fsf[controlName].value);
          break;
        case 'rfc':
          this.buscarPorAfiliado(this.fsf[controlName].value);
          break;
        case 'folioConvenioVigencia':
          this.buscarPorVigencia(this.fsf[controlName].value);
          break;
        case 'numeroFactura':
          this.buscarPorFactura(this.fsf[controlName].value);
          break;
        case 'nombreBeneficiario':
          this.buscarPorBeneficiario(this.fsf[controlName].value);
          break;
        case 'folioSiniestro':
          this.buscarPorSiniestro(this.fsf[controlName].value);
          break;
        default:
          break;
      }
    }
  }

  buscarPorConvenio(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.folioConvenio = subFormValue;
    this.consultaConvenioService.consultarConvenios(datosBusqueda, this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.convenioPrevision = respuesta.datos.content;
          this.totalElementos.tablaConvenios = respuesta.datos.totalElements;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarPorBeneficiario(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.nombreBeneficiario = subFormValue;
    this.consultaConvenioService.consultarBeneficiarios(datosBusqueda, this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.beneficiario = [];
          this.beneficiario = respuesta.datos.content;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarPorFactura(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.numeroFactura = subFormValue;
    this.consultaConvenioService.consultarFacturas(this.obtenerObjetoParaFiltrado(), this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.vigenciaConvenio = [];
          this.facturaConvenio = respuesta.datos.content;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarPorSiniestro(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.folioSiniestro = subFormValue;
    this.consultaConvenioService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.vigenciaConvenio = [];
          this.siniestro = respuesta.datos.content;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarPorAfiliado(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.folioConvenio = subFormValue;
    this.consultaConvenioService.consultarAfiliados(datosBusqueda, this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.vigenciaConvenio = [];
          this.datosAfiliado = respuesta.datos.content;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscarPorVigencia(subFormValue: string): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.folioConvenio = subFormValue;
    this.consultaConvenioService.consultarVigencias(datosBusqueda, this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          this.vigenciaConvenio = [];
          this.vigenciaConvenio = respuesta.datos.content;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  descargarPDF(): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.ruta = "reportes/generales/ReporteTablaConsultaConvenios.jrxml";
    datosBusqueda.tipoReporte = "pdf";
    this.consultaConvenioService.descargarPDF(datosBusqueda).subscribe(
      (respuesta:any) => {
        const file = new Blob([respuesta], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(file);
        //No se ha podido probar la descarga porque el servicio no funciona
      }
    );
  }

  descargarExcel(): void {
    let datosBusqueda = this.obtenerObjetoParaFiltrado();
    datosBusqueda.ruta = "reportes/generales/ReporteTablaConsultaConvenios.jrxml";
    datosBusqueda.tipoReporte = "xls"; 
    this.consultaConvenioService.descargarExcel(datosBusqueda).subscribe(
      (respuesta:any) => {
        const file = new Blob([respuesta], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,'});
        const url = window.URL.createObjectURL(file);
        //No se ha podido probar la descarga porque el servicio no funciona
      }
    );
  }

}
