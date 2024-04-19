import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {SEGUIMIENTO_CONVENIO_BREADCRUMB} from "../../constants/breadcrumb";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {
  mapearArregloTipoDropdown,
  obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado
} from "../../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {
  DefaultNuevoConvenio,
  FiltrosBasicosNuevoConvenio,
  FiltrosNuevoConvenio
} from "../../models/filtros-seguimiento.interface";
import {AutenticacionService} from "../../../../../services/autenticacion.service";

@Component({
  selector: 'app-seguimiento-nuevo-convenio',
  templateUrl: './seguimiento-nuevo-convenio.component.html',
  styleUrls: ['./seguimiento-nuevo-convenio.component.scss'],
  providers: [DialogService, AutenticacionService],
})
export class SeguimientoNuevoConvenioComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  central!: boolean;

  convenios: SeguimientoNuevoConvenio[] = [];
  convenioSeleccionado: SeguimientoNuevoConvenio = {};

  filtroForm!: FormGroup;
  paginacionConFiltrado: boolean = false;

  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  MENSAJE_FILTROS: string = 'Selecciona por favor un criterio de búsqueda.';
  mostrarModalFiltros: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private seguimientoConvenioService: SeguimientoNuevoConvenioService,
    private mensajesSistemaService: MensajesSistemaService,
    private authService: AutenticacionService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SEGUIMIENTO_CONVENIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.catalogoNiveles = this.activatedRoute.snapshot.data["respuesta"];
    this.obtenerVelatorios();
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      velatorio: [{
        value: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      folioConvenioPf: [{value: null, disabled: false}],
      folioConvenioPsfpa: [{value: null, disabled: false}],
      rfcAfiliado: [{value: null, disabled: false}],
    });
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null;
    this.seguimientoConvenioService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.solicitudExitosaVelatorios(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  solicitudExitosaVelatorios(respuesta: HttpRespuesta<any>): void {
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error, 'Error al consultar la información');
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (this.authService.validarUsuarioLogueado()) return;
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
    const filtros: FiltrosBasicosNuevoConvenio = this.obtenerFiltroBasico();
    this.seguimientoConvenioService
      .buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
        error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
      });
  }

  obtenerFiltroBasico(): FiltrosBasicosNuevoConvenio {
    return {
      idVelatorio: this.filtroForm.get('velatorio')?.value
    }
  }

  procesarRespuestaPaginacion(respuesta: HttpRespuesta<any>): void {
    this.convenios = respuesta.datos.content;
    this.totalElementos = respuesta.datos["totalElements"];
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.limpiarFormulario();
    this.numPaginaActual = 0;
    this.paginar();
  }

  limpiarFormulario(): void {
    if (!this.filtroForm) return;
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    const velatorio: number | null = this.central ? null : obtenerVelatorioUsuarioLogueado(usuario);
    const DEFAULT: DefaultNuevoConvenio = {nivel, velatorio}
    this.filtroFormDir.resetForm(DEFAULT);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  paginarConFiltros(): void {
    const filtros: FiltrosNuevoConvenio = this.obtenerFiltroConvenio();
    const valores: string[] = Object.values(filtros);
    if (valores.every(v => v === null)) {
      this.mostrarModalFiltros = true;
      return;
    }
    this.cargadorService.activar();
    this.seguimientoConvenioService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  obtenerFiltroConvenio(): FiltrosNuevoConvenio {
    return {
      convenioPF: this.filtroForm.get('folioConvenioPf')?.value,
      convenioPSFPA: this.filtroForm.get('folioConvenioPsfpa')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      rfc: this.filtroForm.get('rfcAfiliado')?.value
    }
  }

  abrirPanel(event: MouseEvent, convenioSeleccionado: SeguimientoNuevoConvenio): void {
    this.convenioSeleccionado = convenioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  obtenerTipoConvenio(tipo: string): number {
    if (tipo === 'PF Persona') {
      return 3;
    }
    if (tipo === 'PA') {
      return 1;
    }
    return 2;
  }
}
