import {Comisiones, OpcionesArchivos} from '../../models/comisiones.interface';
import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {CalculoComisionesService} from '../../services/calculo-comisiones.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltrosComisiones} from "../../models/filtros-comisiones.interface";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {
  mapearArregloTipoDropdown, obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado,
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import * as moment from "moment/moment";
import {AutenticacionService} from "../../../../services/autenticacion.service";

type ListadoComisiones = Required<Comisiones> & { id: string }

@Component({
  selector: 'app-comisiones',
  templateUrl: './comisiones.component.html',
  styleUrls: ['./comisiones.component.scss'],
  providers: [DialogService, DescargaArchivosService, AutenticacionService]
})
export class ComisionesComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  comisiones: Comisiones[] = [];
  comisionSeleccionado!: Comisiones;
  filtroFormComisiones!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  promotores: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  paginacionConFiltrado: boolean = false;
  mostrarModalDescargaExitosa: boolean = false;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";
  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;

  central!: boolean;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private calculoComisionesService: CalculoComisionesService,
    private router: Router,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
    private authService: AutenticacionService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
    this.obtenerPromotores();
  }

  private cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catatalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    this.obtenerVelatorios();
  }

  abrirDetalleComision(comisionSeleccionado: ListadoComisiones): void {
    this.comisionSeleccionado = comisionSeleccionado;
    void this.router.navigate([`comisiones/detalle-comision/${comisionSeleccionado.idPromotor}`]);
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroFormComisiones = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      delegacion: [{value: obtenerDelegacionUsuarioLogueado(usuario), disabled: +usuario.idOficina > 1}],
      velatorio: [{value: obtenerVelatorioUsuarioLogueado(usuario), disabled: +usuario.idOficina === 3}],
      promotores: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroFormComisiones.get('fechaInicial')?.value;
    const fechaFinal = this.filtroFormComisiones.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroFormComisiones.get('fechaInicial')?.patchValue(null);
    this.filtroFormComisiones.get('fechaFinal')?.patchValue(null);
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
    const filtros: FiltrosComisiones = this.crearSolicitudFiltros("pdf");
    this.cargadorService.activar();
    this.calculoComisionesService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.comisiones = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosComisiones = this.crearSolicitudFiltros("pdf");
    this.cargadorService.activar();
    this.calculoComisionesService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.comisiones = respuesta.datos.content;
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

  crearSolicitudFiltros(tipoReporte: string): FiltrosComisiones {
    const fechaInicial = this.filtroFormComisiones.get('fechaInicial')?.value !== null ? moment(this.filtroFormComisiones.get('fechaInicial')?.value).format('DD/MM/YYYY') : null;
    const fechaFinal = this.filtroFormComisiones.get('fechaFinal')?.value !== null ? moment(this.filtroFormComisiones.get('fechaFinal')?.value).format('DD/MM/YYYY') : null;
    return {
      idNivel: this.filtroFormComisiones.get("nivel")?.value,
      idDelegacion: this.filtroFormComisiones.get("delegacion")?.value,
      idVelatorio: this.filtroFormComisiones.get("velatorio")?.value,
      idPromotor: this.filtroFormComisiones.get("promotores")?.value,
      fechaInicial: fechaInicial,
      fechaFinal: fechaFinal,
      tipoReporte: tipoReporte
    }
  }

  limpiar(): void {
    this.filtroFormComisiones.reset();
    this.catalogoVelatorios = [];
    if (this.filtroFormComisiones) {
      const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
      const DEFAULT = {
        nivel: obtenerNivelUsuarioLogueado(usuario),
        delegacion: this.central ? null : obtenerDelegacionUsuarioLogueado(usuario),
        velatorio: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario)
      }
      this.filtroFormDir.resetForm(DEFAULT);
      if (DEFAULT.delegacion) this.obtenerVelatorios();
      this.obtenerPromotores();
    }
    this.paginar();
  }

  actualizarCatalogos(): void {
    this.obtenerPromotores();
    this.obtenerVelatorios();
  }

  obtenerVelatorios(): void {
    const idDelegacion = this.filtroFormComisiones.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.calculoComisionesService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  obtenerPromotores(): void {
    this.promotores = [];
    const solicitudPromotores = this.crearSolicitudPromotores();
    this.calculoComisionesService.obtenerPromotores(solicitudPromotores).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.promotores = mapearArregloTipoDropdown(respuesta.datos, "nomPromotor", "idPromotor");
        this.promotores = [{value: null, label: 'Todos'}, ...this.promotores];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    })
  }

  crearSolicitudPromotores() {
    return {
      idNivel: this.filtroFormComisiones.get('nivel')?.value,
      idDelegacion: this.filtroFormComisiones.get('delegacion')?.value,
      idVelatorio: this.filtroFormComisiones.get('velatorio')?.value,
      idPromotor: null
    }
  }

  guardarPDF(): void {
    const solicitud: FiltrosComisiones = this.crearSolicitudFiltros("pdf");
    this.cargadorService.activar();
    this.descargaArchivosService.descargarArchivo(this.calculoComisionesService.descargarListadoComisiones(solicitud)).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
        console.log(respuesta)
      },
      error: (error): void => {
        console.log(error)
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  guardarExcel(): void {
    const solicitud: FiltrosComisiones = this.crearSolicitudFiltros('xls');
    this.cargadorService.activar();
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: "reporte", ext: "xlsx"}
    this.descargaArchivosService.descargarArchivo(this.calculoComisionesService.descargarListadoComisiones(solicitud), configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
        console.log(respuesta)
      },
      error: (error): void => {
        console.log(error)
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  get f() {
    return this.filtroFormComisiones?.controls;
  }

}
