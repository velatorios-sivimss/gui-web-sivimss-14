import {SolicitudPago} from '../../models/solicitud-pagos.interface';
import {AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {ActivatedRoute} from '@angular/router';
import {FiltrosSolicitudPago} from '../../models/filtros-solicitud-pagos.interface';
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {
  mapearArregloTipoDropdown, obtenerFechaYHoraActual,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado,
  validarUsuarioLogueado
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import * as moment from "moment/moment";
import {GenerarSolicitudPagoComponent} from '../generar-solicitud-pago/generar-solicitud-pago.component';
import {CancelarSolicitudPagoComponent} from '../cancelar-solicitud-pago/cancelar-solicitud-pago.component';
import {RechazarSolicitudPagoComponent} from '../rechazar-solicitud-pago/rechazar-solicitud-pago.component';
import {VerDetalleSolicitudPagoComponent} from '../ver-detalle-solicitud/ver-detalle-solicitud.component';
import {AprobarSolicitudPagoComponent} from '../aprobar-solicitud-pago/aprobar-solicitud-pago.component';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";

type ListadoSolicitudPago = Required<SolicitudPago> & { id: string }

interface SolicitudReporte {
  idSolicitud: number,
  idTipoSolicitud: string,
  idUnidadOperativa: number | null,
  idVelatorio: number | null,
  cantidadLetra: string,
  tipoReporte: string
}

@Component({
  selector: 'app-solicitudes-pago',
  templateUrl: './solicitudes-pago.component.html',
  styleUrls: ['./solicitudes-pago.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class SolicitudesPagoComponent implements OnInit, AfterContentChecked {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  solicitudesPago: SolicitudPago[] = [];
  solicitudPagoSeleccionado!: SolicitudPago;
  filtroFormSolicitudesPago!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  cancelarRef!: DynamicDialogRef;
  rechazarRef!: DynamicDialogRef;
  aceptarRef!: DynamicDialogRef;

  catalogoEjercicios: TipoDropdown[] = [];
  catatalogoTipoSolicitudes: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();
  refElementos: number = 0;

  mostrarModalDescargaExitosa: boolean = false;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_EJERCICIOS: number = 0;
  readonly POSICION_CATALOGO_TIPOSOLICITUD: number = 1;
  MENSAJE_FILTROS: string = 'Selecciona por favor un criterio de búsqueda.';
  mostrarModalFiltros: boolean = false;

  central!: boolean;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private solicitudesPagoService: SolicitudesPagoService,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  private cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoEjercicios = respuesta[this.POSICION_CATALOGO_EJERCICIOS].datos;
    this.catatalogoTipoSolicitudes = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD].datos, "desTipoSolicitud", "tipoSolicitud");
    this.obtenerVelatorios();
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroFormSolicitudesPago = this.formBuilder.group({
      velatorio: [{
        value: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
      ejercFiscal: [{value: null, disabled: false}],
      tipoSolic: [{value: null, disabled: false}],
      folio: [{value: null, disabled: false}],
    });
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroFormSolicitudesPago.get('fechaInicial')?.value;
    const fechaFinal = this.filtroFormSolicitudesPago.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroFormSolicitudesPago.get('fechaInicial')?.patchValue(null);
    this.filtroFormSolicitudesPago.get('fechaFinal')?.patchValue(null);
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
    this.cargadorService.activar();
    this.solicitudesPagoService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.solicitudesPago = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
          this.refElementos = respuesta.datos.totalElements;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  abrirPanel(event: MouseEvent, solicitudPagoSeleccionado: ListadoSolicitudPago): void {
    this.solicitudPagoSeleccionado = solicitudPagoSeleccionado;
    this.overlayPanel.toggle(event);
  }


  abrirDetalleSolicitudPago(solicitudPagoSeleccionado: ListadoSolicitudPago): void {
    this.solicitudPagoSeleccionado = solicitudPagoSeleccionado;
    this.cargadorService.activar();
    this.cancelarRef = this.dialogService.open(
      VerDetalleSolicitudPagoComponent,
      {
        header: 'Solicitud de comprobación de bienes y servicios',
        width: '880px',
        data: solicitudPagoSeleccionado.idSolicitud
      },
    )
  }

  abrirModalGenerarSolicitudPago(): void {
    this.creacionRef = this.dialogService.open(
      GenerarSolicitudPagoComponent,
      {
        header: 'Generar solicitud de pago',
        width: MAX_WIDTH,
        data: this.refElementos
      },
    );
    this.creacionRef.onClose.subscribe(() => this.limpiar())
  }

  abrirModalCancelarSolicitudPago(): void {
    this.cancelarRef = this.dialogService.open(
      CancelarSolicitudPagoComponent,
      {
        header: 'Cancelar solicitud de pago',
        width: '880px',
        data: this.solicitudPagoSeleccionado
      },
    );
    this.cancelarRef.onClose.subscribe(() => this.limpiar())
  }

  abrirModalAprobarSolicitudPago(): void {
    this.cargadorService.activar();
    this.aceptarRef = this.dialogService.open(
      AprobarSolicitudPagoComponent,
      {
        header: 'Aprobación de solicitud de pago',
        width: '880px',
        data: this.solicitudPagoSeleccionado
      },
    );

    this.aceptarRef.onClose.subscribe(() => this.limpiar());
  }

  abrirModalRechazarSolicitudPago(): void {
    this.cargadorService.activar();
    this.rechazarRef = this.dialogService.open(
      RechazarSolicitudPagoComponent,
      {
        header: 'Rechazar solicitud de pago',
        width: '880px',
        data: this.solicitudPagoSeleccionado
      },
    );
    this.rechazarRef.onClose.subscribe(() => this.limpiar())
  }

  paginarConFiltros(): void {
    const filtros: FiltrosSolicitudPago = this.crearSolicitudFiltros("pdf");
    const form = this.filtroFormSolicitudesPago.getRawValue();
    const valores: string[] = Object.values(form);
    if (valores.every(v => v === null)) {
      this.mostrarModalFiltros = true;
      return;
    }
    this.cargadorService.activar();
    this.solicitudesPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.solicitudesPago = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(tipoReporte: "pdf" | "xls" = "pdf"): FiltrosSolicitudPago {
    const fechaInicial = this.filtroFormSolicitudesPago.get('fechaInicial')?.value !== null ? moment(this.filtroFormSolicitudesPago.get('fechaInicial')?.value).format('YYYY-MM-DD') : null;
    const fechaFinal = this.filtroFormSolicitudesPago.get('fechaFinal')?.value !== null ? moment(this.filtroFormSolicitudesPago.get('fechaFinal')?.value).format('YYYY-MM-DD') : null;
    const folio = this.filtroFormSolicitudesPago.get("folio")?.value !== null ? this.filtroFormSolicitudesPago.get("folio")?.value : null;
    return {
      idNivel: this.filtroFormSolicitudesPago.get("nivel")?.value,
      idDelegacion: this.filtroFormSolicitudesPago.get("delegacion")?.value,
      idVelatorio: this.filtroFormSolicitudesPago.get("velatorio")?.value,
      fecInicial:fechaInicial,
      fecFinal: fechaFinal,
      ejercicioFiscal: this.filtroFormSolicitudesPago.get("ejercFiscal")?.value,
      idTipoSolicitud: this.filtroFormSolicitudesPago.get("tipoSolic")?.value,
      folioSolicitud: folio,
      tipoReporte: tipoReporte
    }
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.numPaginaActual = 0;
    if (this.filtroFormSolicitudesPago) {
      const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
      const DEFAULT = {
        velatorio: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario)
      }
      this.filtroFormDir.resetForm(DEFAULT);
    }
    this.obtenerVelatorios();
    this.paginar();
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null;
    this.solicitudesPagoService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  generarListadoSolicitudes(tipoReporte: "pdf" | "xls" = "pdf"): void {
    this.cargadorService.activar();
    const filtros: FiltrosSolicitudPago = this.crearSolicitudFiltros(tipoReporte);
    const solicitudFiltros: string = JSON.stringify(filtros);
    const ext = tipoReporte === 'pdf' ? 'pdf' : 'xlsx';
    const configuracionArchivo: OpcionesArchivos = {
      nombreArchivo: `Listado Solicitudes ${obtenerFechaYHoraActual()}`,
      ext
    }
    this.descargaArchivosService.descargarArchivo(this.solicitudesPagoService.descargarListadoSolicitudes(solicitudFiltros), configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
        console.log(respuesta)
      },
      error: (error) => {
        const ERROR: string = 'Error en la descarga del documento.Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    })
  }

  descargarReporteSolicitud(tipoReporte: "pdf" | "xls" = "pdf"): void {
    this.cargadorService.activar();
    const solicitud = this.generarSolicitudReporte(tipoReporte);
    const ext = tipoReporte === 'pdf' ? 'pdf' : 'xlsx';
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: `Solicitud Pago ${obtenerFechaYHoraActual()}`, ext}
    this.descargaArchivosService.descargarArchivo(this.solicitudesPagoService.descargarReporteSolicitud(solicitud),
      configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
        console.log(respuesta)
      },
      error: (error): void => {
        const ERROR: string = 'Error en la descarga del documento.Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error)
      },
    });
  }

  generarSolicitudReporte(tipoReporte: "pdf" | "xls" = "pdf"): SolicitudReporte {
    return {
      idSolicitud: this.solicitudPagoSeleccionado.idSolicitud,
      idTipoSolicitud: this.solicitudPagoSeleccionado.idTipoSolicitid,
      idUnidadOperativa: this.solicitudPagoSeleccionado.idUnidadOperartiva ?? null,
      idVelatorio: this.solicitudPagoSeleccionado.idVelatorio ?? null,
      cantidadLetra: convertirNumeroPalabra(this.solicitudPagoSeleccionado.importe) + ' pesos',
      tipoReporte
    }
  }

  get f() {
    return this.filtroFormSolicitudesPago?.controls;
  }

  ngOnDestroy(): void {
    if (this.rechazarRef) {
      this.rechazarRef.destroy();
    }
    if (this.creacionRef) {
      this.creacionRef.destroy();
    }
    if (this.cancelarRef) {
      this.cancelarRef.destroy();
    }
    if (this.aceptarRef) {
      this.aceptarRef.destroy();
    }
  }

}
