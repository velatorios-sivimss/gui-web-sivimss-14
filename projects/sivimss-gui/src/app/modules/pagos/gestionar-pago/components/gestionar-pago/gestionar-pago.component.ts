import {Component, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {GESTIONAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {FormBuilder, FormGroup, FormGroupDirective} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {
  mapearArregloTipoDropdown, obtenerFechaYHoraActual, obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado,
  validarUsuarioLogueado
} from "../../../../../utils/funciones";
import {GestionarPagoService} from "../../services/gestionar-pago.service";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {ActivatedRoute} from "@angular/router";
import {PagoGestion} from "../../models/pagoGestion.interface";
import {OverlayPanel} from "primeng/overlaypanel";
import * as moment from "moment/moment";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-gestionar-pago',
  templateUrl: './gestionar-pago.component.html',
  styleUrls: ['./gestionar-pago.component.scss'],
  providers: [DescargaArchivosService]
})
export class GestionarPagoComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroGestionarPagoForm!: FormGroup;

  catalogoVelatorios: TipoDropdown[] = [];
  foliosODS: TipoDropdown[] = [];
  foliosPNCPF: TipoDropdown[] = [];
  foliosPRCPF: TipoDropdown[] = [];

  readonly POSICION_FOLIO_ODS: number = 0;
  readonly POSICION_FOLIO_PREV_FUN: number = 1;
  readonly POSICION_FOLIO_REN_PREV_FUN: number = 2;

  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  pagos: PagoGestion[] = [];
  tipoFolio: null | 1 | 2 | 3 = null;
  pagoSeleccionado!: PagoGestion;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  mostrarModalDescargaExitosa: boolean = false;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  central!: boolean;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private gestionarPagoService: GestionarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private readonly activatedRoute: ActivatedRoute,
              private alertaService: AlertaService,
              private descargaArchivosService: DescargaArchivosService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GESTIONAR_PAGO_BREADCRUMB);
    this.inicializarForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const foliosODS = respuesta[this.POSICION_FOLIO_ODS].datos;
    this.foliosODS = mapearArregloTipoDropdown(foliosODS, "folio", "folio");
    const foliosPrevFun = respuesta[this.POSICION_FOLIO_PREV_FUN].datos;
    this.foliosPNCPF = mapearArregloTipoDropdown(foliosPrevFun, "folio", "folio");
    const foliosRevPrevFun = respuesta[this.POSICION_FOLIO_REN_PREV_FUN].datos;
    this.foliosPRCPF = mapearArregloTipoDropdown(foliosRevPrevFun, "folio", "folio");
    this.obtenerVelatorios();
  }

  inicializarForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroGestionarPagoForm = this.formBuilder.group({
      velatorio: [{
        value: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      folioODS: [{value: null, disabled: false}],
      folioPNCPF: [{value: null, disabled: false}],
      folioPRCPF: [{value: null, disabled: false}],
      elaboracionInicio: [{value: null, disabled: false}],
      elaboracionFin: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    if (this.filtroGestionarPagoForm) {
      this.tipoFolio = null;
      const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
      this.filtroFormDir.resetForm({velatorio: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario)});
    }
    this.numPaginaActual = 0;
    this.paginar();
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null
    this.gestionarPagoService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  limpiarFolios(folio: 1 | 2 | 3): void {
    this.tipoFolio = folio;
    if (folio === 1) {
      this.filtroGestionarPagoForm.get('folioPNCPF')?.patchValue(null);
      this.filtroGestionarPagoForm.get('folioPRCPF')?.patchValue(null);
      return;
    }
    if (folio === 2) {
      this.filtroGestionarPagoForm.get('folioODS')?.patchValue(null);
      this.filtroGestionarPagoForm.get('folioPRCPF')?.patchValue(null);
      return;
    }
    this.filtroGestionarPagoForm.get('folioODS')?.patchValue(null);
    this.filtroGestionarPagoForm.get('folioPNCPF')?.patchValue(null);
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginarConFiltros(): void {
    this.cargadorService.activar();
    const filtros = this.generarSolicitudFiltros();
    this.gestionarPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      },
    });
  }

  generarSolicitudFiltros() {
    let elaboracionInicio = this.filtroGestionarPagoForm.get('elaboracionInicio')?.value;
    if (elaboracionInicio) elaboracionInicio = moment(elaboracionInicio).format('DD/MM/YYYY');
    let elaboracionFin = this.filtroGestionarPagoForm.get('elaboracionFin')?.value;
    if (elaboracionFin) elaboracionFin = moment(elaboracionFin).format('DD/MM/YYYY');
    let filtros: any = {
      idVelatorio: this.filtroGestionarPagoForm.get('velatorio')?.value,
      fechaIni: elaboracionInicio,
      fechaFin: elaboracionFin,
      nomContratante: this.filtroGestionarPagoForm.get('nombreContratante')?.value
    }
    if (this.filtroGestionarPagoForm.get('folioODS')?.value) {
      filtros = {...filtros, folioODS: this.filtroGestionarPagoForm.get('folioODS')?.value};
    }
    if (this.filtroGestionarPagoForm.get('folioPNCPF')?.value) {
      filtros = {...filtros, folioPF: this.filtroGestionarPagoForm.get('folioPNCPF')?.value};
    }
    if (this.filtroGestionarPagoForm.get('folioPRCPF')?.value) {
      filtros = {...filtros, folioRPF: this.filtroGestionarPagoForm.get('folioPRCPF')?.value};
    }
    return filtros;
  }

  paginar(): void {
    this.cargadorService.activar();
    const filtros = this.generarSolicitudFiltrosBasicos();
    this.gestionarPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      },
    });
  }

  generarSolicitudFiltrosBasicos() {
    const velatorio = this.filtroGestionarPagoForm.get('velatorio')?.value
    return {
      idVelatorio: velatorio === 0 ? null : velatorio,
    }
  }

  abrirPanel(event: MouseEvent, pago: PagoGestion): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroGestionarPagoForm.get('elaboracionInicio')?.value;
    const fechaFinal = this.filtroGestionarPagoForm.get('elaboracionFin')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroGestionarPagoForm.get('elaboracionInicio')?.patchValue(null);
    this.filtroGestionarPagoForm.get('elaboracionFin')?.patchValue(null);
  }

  guardarPDF(): void {
    this.cargadorService.activar();
    const solicitud = this.crearSolicituDescarga();
    const opciones = {nombreArchivo: `Gestionar Pago ${obtenerFechaYHoraActual()}`}
    this.descargaArchivosService.descargarArchivo(this.gestionarPagoService.descargarListado(solicitud), opciones).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
      },
      error: (error): void => {
        const ERROR: string = 'Error en la descarga del documento.Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  guardarExcel(): void {
    this.cargadorService.activar();
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: `Gestionar Pago ${obtenerFechaYHoraActual()}`, ext: "xlsx"}
    const solicitud = this.crearSolicituDescarga('xls');
    this.descargaArchivosService.descargarArchivo(this.gestionarPagoService.descargarListado(solicitud), configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
      },
      error: (error): void => {
        const ERROR: string = 'Error en la descarga del documento.Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  crearSolicituDescarga(tipoReporte: string = 'pdf') {
    return {
      ...this.generarSolicitudFiltros(),
      tipoReporte
    }
  }
}
