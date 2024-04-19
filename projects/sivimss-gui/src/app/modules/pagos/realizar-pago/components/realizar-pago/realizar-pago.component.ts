import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {REALIZAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {
  mapearArregloTipoDropdown, obtenerFechaYHoraActual,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado, validarUsuarioLogueado
} from "../../../../../utils/funciones";
import {Pago} from "../../modelos/pago.interface";
import {FiltroBasico, FiltrosPago} from "../../modelos/filtrosPago.interface";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {DialogService} from "primeng/dynamicdialog";
import {SolicitudDescargaArchivo} from "../../modelos/solicitudDescargaArchivo.interface";
import {forkJoin, Observable} from "rxjs";
import {AutenticacionService} from "../../../../../services/autenticacion.service";

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.scss'],
  providers: [DescargaArchivosService, DialogService, AutenticacionService]
})
export class RealizarPagoComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_FOLIO_ODS: number = 0;
  readonly POSICION_FOLIO_PREV_FUN: number = 1;
  readonly POSICION_FOLIO_REN_PREV_FUN: number = 2;
  readonly POSICION_CATALOGO_NIVELES: number = 3;

  numPaginaActual: number = 0;
  totalElementos: number = 0;

  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

  filtroPagoForm!: FormGroup;
  pagoSeleccionado!: Pago;
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  habilitaIrPago: string[] = ['Generada', 'Vigente', 'Generado', 'Cancelada'];
  habilitaIrPagoEstatus: string[] = ['Pendiente', 'Generado']
  habilitaModificar: string[] = ['Pagada', 'Vigente', 'Generado', 'Cancelada'];
  habilitaModificarPago: string[] = ['Pagado'];
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  catalogoNiveles: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  foliosODS: TipoDropdown[] = [];
  foliosPrevFun: TipoDropdown[] = [];
  foliosRevPrevFun: TipoDropdown[] = [];
  pagos: Pago[] = [];

  tipoFolio: null | 1 | 2 | 3 = null;
  paginacionConFiltrado: boolean = false;
  mostrarModalDescargaExitosa: boolean = false;
  realizarPagoModal: boolean = false;
  central: boolean = false;
  rol!: number;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private alertaService: AlertaService,
              private descargaArchivosService: DescargaArchivosService,
              private authService: AutenticacionService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.rol = +usuario.idRol;
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.inicializarForm();
    if (validarUsuarioLogueado()) return;
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    const foliosODS = respuesta[this.POSICION_FOLIO_ODS].datos;
    this.foliosODS = mapearArregloTipoDropdown(foliosODS, "folio", "folio");
    const foliosPrevFun = respuesta[this.POSICION_FOLIO_PREV_FUN].datos;
    this.foliosPrevFun = mapearArregloTipoDropdown(foliosPrevFun, "folio", "folio");
    const foliosRevPrevFun = respuesta[this.POSICION_FOLIO_REN_PREV_FUN].datos;
    this.foliosRevPrevFun = mapearArregloTipoDropdown(foliosRevPrevFun, "folio", "folio");
    this.obtenerVelatorios();
  }

  inicializarForm(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    const velatorio: number | null = this.central ? null : obtenerVelatorioUsuarioLogueado(usuario);
    this.filtroPagoForm = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      velatorio: [{value: velatorio, disabled: obtenerNivelUsuarioLogueado(usuario) === 3}],
      folioOrden: [{value: null, disabled: false}, []],
      folioConvenio: [{value: null, disabled: false}, []],
      folioRenovacion: [{value: null, disabled: false}, []],
      periodoInicio: [{value: null, disabled: false}, []],
      periodoFin: [{value: null, disabled: false}, []],
      nombreContratante: [{value: null, disabled: false}, []],
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.limpiarFormulario();
    this.cargarCatalogosCambioVelatorio();
    this.numPaginaActual = 0;
    this.paginar();
  }

  limpiarFormulario(): void {
    if (!this.filtroPagoForm) return;
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    const velatorio: number | null = this.central ? null : obtenerVelatorioUsuarioLogueado(usuario);
    const DEFAULT = {nivel, velatorio}
    this.filtroFormDir.resetForm(DEFAULT);
    this.tipoFolio = null;
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
      return;
    }
    this.paginar();
  }

  cargarCatalogosCambioVelatorio(): void {
    const velatorio = this.filtroPagoForm.get('velatorio')?.value;
    this.cargadorService.activar()
    forkJoin([this.obtenerFoliosODS(velatorio), this.obtenerFoliosPF(velatorio), this.obtenerFoliosRPF(velatorio)]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
        next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]) => this.procesarCargaCatalogos(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
      }
    )
  }

  procesarCargaCatalogos(respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]): void {
    const folioODS = respuesta[this.POSICION_FOLIO_ODS].datos;
    this.foliosODS = mapearArregloTipoDropdown(folioODS, "folio", "folio");
    const foliosPrevFun = respuesta[this.POSICION_FOLIO_PREV_FUN].datos;
    this.foliosPrevFun = mapearArregloTipoDropdown(foliosPrevFun, "folio", "folio");
    const foliosRevPrevFun = respuesta[this.POSICION_FOLIO_REN_PREV_FUN].datos;
    this.foliosRevPrevFun = mapearArregloTipoDropdown(foliosRevPrevFun, "folio", "folio");
    this.filtroPagoForm.get('folioOrden')?.patchValue(null);
    this.filtroPagoForm.get('folioConvenio')?.patchValue(null);
    this.filtroPagoForm.get('folioRenovacion')?.patchValue(null);
    this.tipoFolio = null;
  }

  obtenerFoliosODS(velatorio: number | null): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarFoliosODS(velatorio);
  }

  obtenerFoliosPF(velatorio: number | null): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarFoliosPrevFun(velatorio);
  }

  obtenerFoliosRPF(velatorio: number | null): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.consultarFoliosRenPrevFun(velatorio);
  }

  guardarPDF(): void {
    const solicitud: SolicitudDescargaArchivo = this.crearSolicituDescarga();
    this.cargadorService.activar();
    const opciones: OpcionesArchivos = {nombreArchivo: `Realizar Pago ${obtenerFechaYHoraActual()}`};
    this.descargaArchivosService.descargarArchivo(this.realizarPagoService.descargarListado(solicitud), opciones).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => this.manejarMensajeDescargaExitosa(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeErrorDescarga(error),
    });
  }

  guardarExcel(): void {
    const solicitud: SolicitudDescargaArchivo = this.crearSolicituDescarga('xls');
    this.cargadorService.activar();
    const configuracionArchivo: OpcionesArchivos = {
      nombreArchivo: `Realizar Pago ${obtenerFechaYHoraActual()}`,
      ext: "xlsx"
    }
    this.descargaArchivosService.descargarArchivo(this.realizarPagoService.descargarListado(solicitud), configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => this.manejarMensajeDescargaExitosa(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeErrorDescarga(error),
    });
  }

  private manejarMensajeErrorDescarga(error: HttpErrorResponse): void {
    const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
    this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento. Intenta nuevamente.');
  }

  private manejarMensajeDescargaExitosa(respuesta: boolean): void {
    if (!respuesta) return;
    this.mostrarModalDescargaExitosa = !this.mostrarModalDescargaExitosa;
  }

  crearSolicituDescarga(tipoReporte: string = 'pdf'): SolicitudDescargaArchivo {
    const folio: string | null = this.obtenerValorFolio();
    let idFlujoPagos: number | null = this.tipoFolio || null;
    let fechaInicio: string | null = this.recuperarFormatoFecha(this.filtroPagoForm.get('periodoInicio')?.value);
    let fechaFin: string | null = this.recuperarFormatoFecha(this.filtroPagoForm.get('periodoFin')?.value);
    return {
      fechaFin,
      fechaInicio,
      folio,
      idFlujoPagos,
      idVelatorio: this.filtroPagoForm.get('velatorio')?.value,
      nomContratante: this.filtroPagoForm.get('nombreContratante')?.value,
      tipoReporte
    }
  }

  paginarConFiltros(): void {
    const filtros: FiltrosPago = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.realizarPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaBusqueda(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  paginar(): void {
    const filtros: FiltroBasico = this.crearSolicitudFiltrosBasicos();
    this.cargadorService.activar();
    this.realizarPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaBusqueda(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  private manejarRespuestaBusqueda(respuesta: HttpRespuesta<any>): void {
    this.pagos = respuesta.datos.content;
    this.totalElementos = respuesta.datos.totalElements;
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  crearSolicitudFiltros(): FiltrosPago {
    const folio: string | null = this.obtenerValorFolio();
    const velatorio = this.filtroPagoForm.get('velatorio')?.value
    let fechaInicio: string | null = this.recuperarFormatoFecha(this.filtroPagoForm.get('periodoInicio')?.value);
    let fechaFin: string | null = this.recuperarFormatoFecha(this.filtroPagoForm.get('periodoFin')?.value);
    return {
      folio,
      fechaFin,
      fechaInicio,
      idVelatorio: velatorio === 0 ? null : velatorio,
      nomContratante: this.filtroPagoForm.get('nombreContratante')?.value,
      idFlujoPagos: this.tipoFolio
    }
  }

  recuperarFormatoFecha(fecha: string): string | null {
    if (!fecha) return null
    return moment(fecha).format('YYYY-MM-DD');
  }

  crearSolicitudFiltrosBasicos(): FiltroBasico {
    const velatorio = this.filtroPagoForm.get('velatorio')?.value
    return {
      idVelatorio: velatorio === 0 ? null : velatorio,
    }
  }

  obtenerValorFolio(): string | null {
    if (this.tipoFolio === 1) {
      return this.filtroPagoForm.get('folioOrden')?.value;
    }
    if (this.tipoFolio === 2) {
      return this.filtroPagoForm.get('folioConvenio')?.value;
    }
    if (this.tipoFolio === 3) {
      return this.filtroPagoForm.get('folioRenovacion')?.value;
    }
    return null;
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null;
    this.realizarPagoService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.cargarCatalogoVelatorios(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  cargarCatalogoVelatorios(respuesta: HttpRespuesta<any>): void {
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
  }

  limpiarFolios(folio: 1 | 2 | 3): void {
    this.tipoFolio = folio;
    if (folio === 1) {
      this.filtroPagoForm.get('folioConvenio')?.patchValue(null);
      this.filtroPagoForm.get('folioRenovacion')?.patchValue(null);
      return;
    }
    if (folio === 2) {
      this.filtroPagoForm.get('folioOrden')?.patchValue(null);
      this.filtroPagoForm.get('folioRenovacion')?.patchValue(null);
      return;
    }
    this.filtroPagoForm.get('folioOrden')?.patchValue(null);
    this.filtroPagoForm.get('folioConvenio')?.patchValue(null);
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroPagoForm.get('periodoInicio')?.value;
    const fechaFinal = this.filtroPagoForm.get('periodoFin')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroPagoForm.get('periodoInicio')?.patchValue(null);
    this.filtroPagoForm.get('periodoFin')?.patchValue(null);
  }

  modificarPago(): void {
    void this.router.navigate(["./modificar-metodo-de-pago", this.pagoSeleccionado.idPagoBitacora],
      {relativeTo: this.activatedRoute});
  }

  abrirPanel(event: MouseEvent, pago: Pago): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

}
