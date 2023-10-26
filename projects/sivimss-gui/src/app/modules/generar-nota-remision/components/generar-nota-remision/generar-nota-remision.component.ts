import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {
  mapearArregloTipoDropdown,
  obtenerDelegacionUsuarioLogueado, obtenerFechaYHoraActual,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado, validarUsuarioLogueado
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {
  BusquedaFiltro,
  ClavesEstatus,
  FiltrosBasicos,
  GenerarReporte,
  NotaRemision, SolicitudDescarga
} from '../../models/nota-remision.interface';
import {GenerarNotaRemisionService} from '../../services/generar-nota-remision.service';
import * as moment from "moment/moment";
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {finalize, of} from 'rxjs';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {mensajes} from '../../../reservar-salas/constants/mensajes';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'app-generar-nota-remision',
  templateUrl: './generar-nota-remision.component.html',
  styleUrls: ['./generar-nota-remision.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  notasRemision: NotaRemision[] = [];
  notaRemisionSeleccionada!: NotaRemision;
  filtroForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;
  hayCamposObligatorios: boolean = false;
  fechaActual: Date = new Date();
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  foliosGenerados: TipoDropdown[] = [];
  clavesEstatus: ClavesEstatus = {
    1: 'Sin nota',
    2: 'Generada',
    3: 'Cancelada',
  };

  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);
  mostrarModalDescargaExitosa: boolean = false;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarNotaRemisionService: GenerarNotaRemisionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
    private readonly cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    const delegacion = this.filtroForm.get('delegacion')?.value;
    if (delegacion) this.obtenerVelatorios(true);
    this.obtenerFoliosGenerados();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      delegacion: [{value: obtenerDelegacionUsuarioLogueado(usuario), disabled: +this.rolLocalStorage.idOficina >= 2}],
      velatorio: [{value: obtenerVelatorioUsuarioLogueado(usuario), disabled: +this.rolLocalStorage.idOficina === 3}],
      folio: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  generarNotaRemision(): void {
    void this.router.navigate([`detalle-orden-servicio/${this.notaRemisionSeleccionada.id}`], {relativeTo: this.activatedRoute})
  }

  verDetalleNotaRemision(): void {
    void this.router.navigate([`detalle-formato/${this.notaRemisionSeleccionada.idNota}/${this.notaRemisionSeleccionada.id}`], {relativeTo: this.activatedRoute})
  }

  cancelarNotaRemision(): void {
    void this.router.navigate([`cancelar-formato/${this.notaRemisionSeleccionada.idNota}/${this.notaRemisionSeleccionada.id}`], {relativeTo: this.activatedRoute})
  }

  abrirPanel(event: MouseEvent, notaRemisionSeleccionada: NotaRemision): void {
    this.notaRemisionSeleccionada = notaRemisionSeleccionada;
    this.overlayPanel.toggle(event);
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

  paginar(): void {
    const filtros: FiltrosBasicos = this.obtenerFiltrosBasicos();
    this.realizarSolicitudBusqueda(filtros);
  }

  obtenerFiltrosBasicos(): FiltrosBasicos {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    return {
      nivel: obtenerNivelUsuarioLogueado(usuario),
      velatorio: obtenerVelatorioUsuarioLogueado(usuario),
      delegacion: obtenerDelegacionUsuarioLogueado(usuario)
    };
  }

  private realizarSolicitudBusqueda(filtros: FiltrosBasicos): void {
    this.cargadorService.activar();
    this.generarNotaRemisionService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaBusqueda(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  private manejarRespuestaBusqueda(respuesta: HttpRespuesta<any>): void {
    this.notasRemision = respuesta.datos?.content ?? [];
    this.totalElementos = respuesta.datos?.totalElements ?? 0;
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  paginarConFiltros(): void {
    this.cargadorService.activar();
    const filtros: BusquedaFiltro = this.obtenerObjetoParaFiltrado()
    this.generarNotaRemisionService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaBusqueda(respuesta),
      error: (error: HttpErrorResponse) => this.manejarMensajeError(error)
    });
  }

  obtenerObjetoParaFiltrado(): BusquedaFiltro {
    const fechaInicial: string | null = this.obtenerFechaInicial();
    const fechaFinal: string | null = this.obtenerFechaFinal();
    return {
      idNivel: this.filtroForm.get('nivel')?.value,
      idDelegacion: this.filtroForm.get('delegacion')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      folioODS: this.filtroForm.get('folio')?.value,
      fecIniODS: fechaInicial,
      fecFinODS: fechaFinal,
    }
  }

  obtenerFechaInicial(): string | null {
    const fechaInicial = this.filtroForm.get('fechaInicial')?.value;
    return fechaInicial ? moment(fechaInicial).format('DD/MM/YYYY') : null;
  }

  obtenerFechaFinal(): string | null {
    const fechaFinal = this.filtroForm.get('fechaInicial')?.value;
    return fechaFinal ? moment(fechaFinal).format('DD/MM/YYYY') : null;
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.limpiarFormulario();
    this.foliosGenerados = [];
    this.numPaginaActual = 0;
    this.seleccionarDelegacion(true);
    this.paginar();
  }

  limpiarFormulario(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    const delegacion: number | null = obtenerDelegacionUsuarioLogueado(usuario);
    this.filtroFormDir.resetForm({nivel, velatorio, delegacion});
  }

  obtenerFoliosGenerados(): void {
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    const idVelatorio = this.filtroForm.get('velatorio')?.value;
    this.generarNotaRemisionService.buscarTodasOdsGeneradas(idDelegacion, idVelatorio).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.foliosGenerados = mapearArregloTipoDropdown(respuesta.datos, "nombre", "nombre");
      },
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  obtenerVelatorios(cargaInicial: boolean = false): void {
    const delegacion = this.filtroForm.get('delegacion')?.value;
    if (!cargaInicial) {
      this.filtroForm.get('velatorio')?.patchValue(null);
    }
    this.generarNotaRemisionService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  seleccionarDelegacion(cargaInicial: boolean = false): void {
    this.obtenerVelatorios(cargaInicial);
    this.obtenerFoliosGenerados();
  }

  generarReporteNotaRemision(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: `Reporte Nota Remisión ${obtenerFechaYHoraActual()}`};
    if (tipoReporte == "xls") configuracionArchivo.ext = "xlsx"
    this.cargadorService.activar();
    const busqueda: GenerarReporte = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.generarNotaRemisionService.generarReporteNotaRemision(busqueda), configuracionArchivo)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: boolean): void => this.manejarMensajeDescargaExitosa(respuesta),
        error: (error: HttpErrorResponse): void => this.manejarMensajeErrorDescarga(error),
      });
  }

  filtrosArchivos(tipoReporte: string): GenerarReporte {
    return {
      idNota: this.notaRemisionSeleccionada.idNota,
      idOrden: this.notaRemisionSeleccionada.id,
      tipoReporte,
    }
  }

  guardarPDF(): void {
    const busqueda: SolicitudDescarga = this.prepararSolicitudDescarga();
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: `Listado Notas Remisión ${obtenerFechaYHoraActual()}`};
    this.generarYDescargarArchivo(busqueda, configuracionArchivo);
  }

  guardarExcel(): void {
    const busqueda: SolicitudDescarga = this.prepararSolicitudDescarga('xls');
    const configuracionArchivo: OpcionesArchivos = {
      ext: 'xlsx',
      nombreArchivo: `Listado Notas Remisión ${obtenerFechaYHoraActual()}`
    };
    this.generarYDescargarArchivo(busqueda, configuracionArchivo);
  }

  private prepararSolicitudDescarga(tipoReporte: 'pdf' | 'xls' = 'pdf'): SolicitudDescarga {
    if (!this.paginacionConFiltrado) {
      return this.prepararSolicitudDescargaSinFiltrado(tipoReporte);
    }
    return this.prepararSolicitudDescargaConFiltrado(tipoReporte);
  }

  private prepararSolicitudDescargaSinFiltrado(tipoReporte: 'pdf' | 'xls'): SolicitudDescarga {
    return {
      idNivel: this.filtroForm.get('nivel')?.value,
      idDelegacion: this.filtroForm.get('delegacion')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      tipoReporte
    }
  }

  private prepararSolicitudDescargaConFiltrado(tipoReporte: 'pdf' | 'xls'): SolicitudDescarga {
    const fechaInicial: string | null = this.obtenerFechaInicial();
    const fechaFinal: string | null = this.obtenerFechaFinal();
    return {
      idNivel: this.filtroForm.get('nivel')?.value,
      idDelegacion: this.filtroForm.get('delegacion')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      folioODS: this.filtroForm.get('folio')?.value,
      fecIniODS: fechaInicial,
      fecFinODS: fechaFinal,
      tipoReporte
    }
  }

  private generarYDescargarArchivo(solicitudDescarga: SolicitudDescarga, configuracionArchivo: OpcionesArchivos): void {
    this.cargadorService.activar();
    this.generarNotaRemisionService.generarReporteTabla(solicitudDescarga).pipe(
      switchMap((respuesta: HttpRespuesta<any>) => {
        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo)
          )],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)}
        );
        return this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo);
      }),
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuestaDescarga: boolean) => this.manejarMensajeDescargaExitosa(respuestaDescarga),
      error: (error: HttpErrorResponse) => this.manejarMensajeErrorDescarga(error)
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

  get f() {
    return this.filtroForm?.controls;
  }
}
