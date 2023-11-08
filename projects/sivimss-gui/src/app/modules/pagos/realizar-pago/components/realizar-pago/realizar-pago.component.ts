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
import {FiltrosPago} from "../../modelos/filtrosPago.interface";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {DialogService} from "primeng/dynamicdialog";

interface SolicitudDescargaArchivo {
  folio: string | null,
  fechaFin: string,
  fechaInicio: string,
  idVelatorio: number,
  nomContratante: string,
  idFlujoPagos: number | null,
  tipoReporte: string
}

interface FiltroBasico {
  nivel: number,
  velatorio: number | null
}

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.scss'],
  providers: [DescargaArchivosService, DialogService]
})
export class RealizarPagoComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_FOLIO_ODS: number = 1;
  readonly POSICION_FOLIO_PREV_FUN: number = 2;
  readonly POSICION_FOLIO_REN_PREV_FUN: number = 3;

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

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private alertaService: AlertaService,
              private descargaArchivosService: DescargaArchivosService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.inicializarForm();
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
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
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
    if (this.filtroPagoForm) {
      const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
      const nivel: number = obtenerNivelUsuarioLogueado(usuario);
      const velatorio: number | null = this.central ? null : obtenerVelatorioUsuarioLogueado(usuario);
      const DEFAULT: FiltroBasico = {nivel, velatorio}
      this.filtroFormDir.resetForm(DEFAULT);
      this.tipoFolio = null;
    }
    this.numPaginaActual = 0;
    this.paginar();
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
    this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
  }

  private manejarMensajeDescargaExitosa(respuesta: boolean): void {
    if (!respuesta) return;
    this.mostrarModalDescargaExitosa = !this.mostrarModalDescargaExitosa;
  }

  crearSolicituDescarga(tipoReporte: string = 'pdf'): SolicitudDescargaArchivo {
    let folio: string | null = null;
    let idFlujoPagos: number | null = null;
    if (this.filtroPagoForm.get('folioOrden')?.value) {
      folio = this.filtroPagoForm.get('folioOrden')?.value;
      idFlujoPagos = 1;
    }
    if (this.filtroPagoForm.get('folioConvenio')?.value) {
      folio = this.filtroPagoForm.get('folioConvenio')?.value;
      idFlujoPagos = 2;
    }
    if (this.filtroPagoForm.get('folioRenovacion')?.value) {
      folio = this.filtroPagoForm.get('folioRenovacion')?.value;
      idFlujoPagos = 3;
    }
    return {
      fechaFin: this.filtroPagoForm.get('periodoInicio')?.value,
      fechaInicio: this.filtroPagoForm.get('periodoFin')?.value,
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
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  paginar(): void {
    this.cargadorService.activar();
    this.realizarPagoService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
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

  crearSolicitudFiltros(): FiltrosPago {
    let folio = null
    if (this.tipoFolio === 1) {
      folio = this.filtroPagoForm.get('folioOrden')?.value;
    }
    if (this.tipoFolio === 2) {
      folio = this.filtroPagoForm.get('folioConvenio')?.value;
    }
    if (this.tipoFolio === 3) {
      folio = this.filtroPagoForm.get('folioRenovacion')?.value;
    }
    const velatorio = this.filtroPagoForm.get('velatorio')?.value
    return {
      folio,
      fechaFin: this.filtroPagoForm.get('periodoFin')?.value,
      fechaInicio: this.filtroPagoForm.get('periodoInicio')?.value,
      idVelatorio: velatorio === 0 ? null : velatorio,
      nomContratante: this.filtroPagoForm.get('nombreContratante')?.value,
      idFlujoPagos: this.tipoFolio
    }
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null;
    this.realizarPagoService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
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

  redireccionPago(): void {
    if (this.pagoSeleccionado.tipoPago === 'Pago de Orden de Servicio') {
      void this.router.navigate(["./pago-orden-servicio"], {relativeTo: this.activatedRoute});
      return;
    }
    if (this.pagoSeleccionado.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      void this.router.navigate(["./pago-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
      return;
    }
    void this.router.navigate(["./pago-renovacion-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
  }

  modificarPago(): void {
    void this.router.navigate(["./modificar-metodo-de-pago", this.pagoSeleccionado.idPagoBitacora],
      {relativeTo: this.activatedRoute});
  }

  abrirModalDetallePago(pago: any): void {
    console.log(pago);
  }

  abrirPanel(event: MouseEvent, pago: Pago): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  abrirModalPago(): void {
    this.realizarPagoModal = !this.realizarPagoModal;
  }

}
