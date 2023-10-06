import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {
  mapearArregloTipoDropdown,
  obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado, validarUsuarioLogueado
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {BusquedaFiltro, ClavesEstatus, GenerarReporte, NotaRemision} from '../../models/nota-remision.interface';
import {GenerarNotaRemisionService} from '../../services/generar-nota-remision.service';
import * as moment from "moment/moment";
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {finalize} from 'rxjs';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {mensajes} from '../../../reservar-salas/constants/mensajes';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

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
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const filtros = {
      nivel: obtenerNivelUsuarioLogueado(usuario),
      velatorio: obtenerVelatorioUsuarioLogueado(usuario),
      delegacion: obtenerDelegacionUsuarioLogueado(usuario)
    };
    this.generarNotaRemisionService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.notasRemision = respuesta.datos?.content ?? [];
        this.totalElementos = respuesta.datos?.totalElements ?? 0;
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

  paginarConFiltros(): void {
    this.cargadorService.activar();
    const filtros: BusquedaFiltro = this.obtenerObjetoParaFiltrado()
    this.generarNotaRemisionService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.notasRemision = respuesta.datos?.content ?? [];
        this.totalElementos = respuesta.datos?.totalElements ?? 0;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  obtenerObjetoParaFiltrado(): BusquedaFiltro {
    let fechaInicial = this.filtroForm.get('fechaInicial')?.value;
    if (fechaInicial) fechaInicial = moment(this.f.fechaInicial.value).format('DD/MM/YYYY');
    let fechaFinal = this.filtroForm.get('fechaFinal')?.value;
    if (fechaFinal) fechaFinal = moment(this.f.fechaFinal.value).format('DD/MM/YYYY');
    return {
      idNivel: this.filtroForm.get('nivel')?.value,
      idDelegacion: this.filtroForm.get('delegacion')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      folioODS: this.filtroForm.get('folio')?.value,
      fecIniODS: fechaInicial,
      fecFinODS: fechaFinal,
    }
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: number | null = obtenerDelegacionUsuarioLogueado(usuario);
    this.foliosGenerados = [];
    this.filtroFormDir.resetForm({
      nivel: obtenerNivelUsuarioLogueado(usuario),
      velatorio: obtenerVelatorioUsuarioLogueado(usuario),
      delegacion
    });
    this.numPaginaActual = 0;
    this.seleccionarDelegacion(true);
    this.paginar();
  }

  obtenerFoliosGenerados(): void {
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    const idVelatorio = this.filtroForm.get('velatorio')?.value;
    this.generarNotaRemisionService.buscarTodasOdsGeneradas(idDelegacion, idVelatorio).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.foliosGenerados = mapearArregloTipoDropdown(respuesta.datos, "nombre", "nombre");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
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
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  seleccionarDelegacion(cargaInicial: boolean = false): void {
    this.obtenerVelatorios(cargaInicial);
    this.obtenerFoliosGenerados();
  }

  generarReporteNotaRemision(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.cargadorService.activar();
    const busqueda: GenerarReporte = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.generarNotaRemisionService.generarReporteNotaRemision(busqueda), configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: any): void => {
        console.log(respuesta);
        this.mostrarModalDescargaExitosa = true;
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  filtrosArchivos(tipoReporte: string): GenerarReporte {
    return {
      idNota: this.notaRemisionSeleccionada.idNota,
      idOrden: this.notaRemisionSeleccionada.id,
      tipoReporte,
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }


}
