import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from '../../../../utils/constantes';
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {BreadcrumbService} from '../../../../shared/breadcrumb/services/breadcrumb.service';
import {ConsultaPaginado, GenerarReporte} from '../../models/servicios-funerarios.interface';
import {LazyLoadEvent} from 'primeng/api';
import {AlertaService, TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {MensajesSistemaService} from '../../../../services/mensajes-sistema.service';
import {ServiciosFunerariosConsultaService} from '../../services/servicios-funerarios-consulta.service';
import {LoaderService} from '../../../../shared/loader/services/loader.service';
import {finalize} from 'rxjs/operators';
import {HttpRespuesta} from '../../../../models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {
  mapearArregloTipoDropdown,
  obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado
} from '../../../../utils/funciones';
import {PaginadoInterface} from '../../models/paginado.interface';
import * as moment from 'moment';
import {OpcionesArchivos} from '../../../../models/opciones-archivos.interface';
import {DescargaArchivosService} from '../../../../services/descarga-archivos.service';
import {of} from 'rxjs';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import {AutenticacionService} from "../../../../services/autenticacion.service";

@Component({
  selector: 'app-servicios-funerarios',
  templateUrl: './servicios-funerarios.component.html',
  styleUrls: ['./servicios-funerarios.component.scss'],
  providers: [DescargaArchivosService, AutenticacionService],
})
export class ServiciosFunerariosComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_ESTATUS: number = 2;

  rolUsuarioEnSesion: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
  nivelUsuario: number = 0;

  filtroForm!: FormGroup;

  fechaActual: Date = new Date();

  nivel: TipoDropdown[] = [];
  delegacion: TipoDropdown[] = [];
  estatus: TipoDropdown[] = [];
  velatorio: TipoDropdown[] = [];

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  servicioFunerario: ConsultaPaginado[] = [];
  servicioSeleccionado!: ConsultaPaginado;
  mostrarModalConfirmacion: boolean = false;
  mensajeArchivoConfirmacion: string = '';
  mostrarModalCancelarPlan: boolean = false;

  mensajeCriterioBusqueda: string = '';
  aceptarCriteriosBusqueda: boolean = false;
  cargaInicial: boolean = true;
  filtros!: PaginadoInterface;
  fechaAnterior: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private descargaArchivosService: DescargaArchivosService,
    private formBuilder: FormBuilder,
    private router: Router,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosConsultaService,
    private readonly loaderService: LoaderService,
    private authService: AutenticacionService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
    this.nivelUsuario = obtenerNivelUsuarioLogueado(this.rolUsuarioEnSesion);
    this.inicializarFiltroForm();
  }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarCatalogos();
    const delegacion = this.filtroForm.get('delegacion')?.value;
    if (delegacion) this.consultarVelatorios();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    const nivel: number = +this.rolUsuarioEnSesion.idOficina;
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: nivel, disabled: true}],
      delegacion: [{value: obtenerDelegacionUsuarioLogueado(this.rolUsuarioEnSesion), disabled: nivel >= 2,}],
      velatorio: [{value: obtenerVelatorioUsuarioLogueado(this.rolUsuarioEnSesion), disabled: nivel === 3}],
      folioPlanSFPA: [{value: null, disabled: false}],
      rfc: [{value: null, disabled: false}],
      curp: [{value: null, disabled: false}],
      estatus: [{value: null, disabled: false}],
      afiliado: [{value: null, disabled: false}],
      rangoInicio: [{value: null, disabled: false}],
      rangoFin: [{value: null, disabled: false}],
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.nivel = respuesta[this.POSICION_NIVELES];
    this.delegacion = respuesta[this.POSICION_DELEGACIONES];
    this.estatus = respuesta[this.POSICION_ESTATUS].filter((elemento: any) => (elemento.label !== 'CON ADEUDO'));
  }

  limpiar(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    const delegacion: number | null = obtenerDelegacionUsuarioLogueado(usuario);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    this.filtroForm.reset({nivel, delegacion, velatorio});
    this.paginar();
  }

  paginar(event?: LazyLoadEvent, obtenerNuevosDatos: boolean = true): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    } else {
      this.numPaginaActual = 0;
    }
    this.paginarPorFiltros(obtenerNuevosDatos);
  }

  paginarPorFiltros(obtenerNuevosDatos: boolean = false): void {
    this.servicioFunerario = [];
    if (obtenerNuevosDatos || this.cargaInicial) {
      this.filtros = this.obtenerObjetoParaFiltrado();
    }
    this.cargaInicial = false;
    this.loaderService.activar();
    this.serviciosFunerariosService
      .paginar(this.numPaginaActual, this.cantElementosPorPagina, this.filtros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.manejarRespuestaBusqueda(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  private manejarRespuestaBusqueda(respuesta: HttpRespuesta<any>): void {
    this.servicioFunerario = respuesta.datos.content;
    this.totalElementos = respuesta.datos.totalElements;
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  obtenerObjetoParaFiltrado(): PaginadoInterface {
    const fechaInicio = this.filtroForm.get('rangoInicio')?.value;
    const fechaFin = this.filtroForm.get('rangoFin')?.value;
    return {
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      numFolioPlanSfpa: this.filtroForm.get('folioPlanSFPA')?.value,
      rfc: this.filtroForm.get('rfc')?.value,
      curp: this.filtroForm.get('curp')?.value,
      nombreAfiliado: this.filtroForm.get('afiliado')?.value,
      idEstatusPlanSfpa: this.filtroForm.get('estatus')?.value,
      fechaInicio: this.recuperarFormatoFecha(fechaInicio),
      fechaFin: this.recuperarFormatoFecha(fechaFin)
    };
  }

  recuperarFormatoFecha(fecha: string): string | null {
    if (!fecha) return null
    return moment(fecha).format('YYYY-MM-DD');
  }

  obtenerObjetoParaReporte(tipoReporte: string): GenerarReporte {
    const fechaInicio = this.filtroForm.get('rangoInicio')?.value;
    const fechaFin = this.filtroForm.get('rangoFin')?.value;
    return {
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      numFolioPlanSfpa: this.filtroForm.get('folioPlanSFPA')?.value,
      rfc: this.filtroForm.get('rfc')?.value,
      curp: this.filtroForm.get('curp')?.value,
      nombreAfiliado: this.filtroForm.get('afiliado')?.value,
      idEstatusPlanSfpa: this.filtroForm.get('estatus')?.value,
      fechaInicio: this.recuperarFormatoFecha(fechaInicio),
      fechaFin: this.recuperarFormatoFecha(fechaFin),
      tipoReporte
    };
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroForm.get('rangoInicio')?.value;
    const fechaFinal = this.filtroForm.get('rangoFin')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroForm.get('rangoInicio')?.patchValue(null);
    this.filtroForm.get('rangoFin')?.patchValue(null);
  }

  consultarVelatorios(): void {
    this.loaderService.activar();
    const delegacion = this.filtroForm.get('delegacion')?.value;
    this.serviciosFunerariosService
      .obtenerCatalogoVelatoriosPorDelegacion(delegacion).pipe(
      finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaVelatorios(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  procesarRespuestaVelatorios(respuesta: HttpRespuesta<any>): void {
    this.velatorio = mapearArregloTipoDropdown(respuesta.datos, 'nomVelatorio', 'idVelatorio');
  }

  exportarArchivo(extension: string): void {
    this.loaderService.activar();
    const filtros: GenerarReporte = this.obtenerObjetoParaReporte(extension);
    const configuracionArchivo: OpcionesArchivos = {};
    if (extension.includes('xls')) {
      configuracionArchivo.ext = 'xlsx';
    }
    filtros.tipoReporte = extension;
    this.serviciosFunerariosService
      .generarArchivoPaginador(filtros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const file = new Blob(
            [
              this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(
                  configuracionArchivo
                )
              ),
            ],
            {
              type: this.descargaArchivosService.obtenerContentType(
                configuracionArchivo
              ),
            }
          );
          this.descargaArchivosService
            .descargarArchivo(of(file), configuracionArchivo)
            .pipe(finalize(() => this.loaderService.desactivar()))
            .subscribe({
              next: (respuestaArchivo): void => {
                if (respuestaArchivo) {
                  this.mensajeArchivoConfirmacion =
                    this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                  this.mostrarModalConfirmacion = true;
                }
              },
              error: (error): void => {
                this.alertaService.mostrar(
                  TipoAlerta.Error,
                  this.mensajesSistemaService.obtenerMensajeSistemaPorId(64)
                );
              },
            });
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(64)
          );
        },
      });
  }

  verContrato(): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    this.serviciosFunerariosService
      .consultarContrato(this.servicioSeleccionado.idPlanSfpa)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const file = new Blob(
            [
              this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(
                  configuracionArchivo
                )
              ),
            ],
            {
              type: this.descargaArchivosService.obtenerContentType(
                configuracionArchivo
              ),
            }
          );

          this.descargaArchivosService
            .descargarArchivo(of(file), configuracionArchivo)
            .pipe(finalize(() => this.loaderService.desactivar()))
            .subscribe({
              next: (respuestaArchivo): void => {
                if (respuestaArchivo) {
                  this.mensajeArchivoConfirmacion =
                    this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                  this.mostrarModalConfirmacion = true;
                }
              },
              error: (error): void => {
                this.alertaService.mostrar(
                  TipoAlerta.Error,
                  this.mensajesSistemaService.obtenerMensajeSistemaPorId(64)
                );
              },
            });
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(64)
          );
        },
      });
  }

  abrirPanel(event: MouseEvent, servicioFunerario: ConsultaPaginado): void {
    this.servicioSeleccionado = servicioFunerario;
    this.overlayPanel.toggle(event);
  }

  detallePago(): void {
    void this.router.navigate(['servicios-funerarios/detalle-pago'],
      {queryParams: {idPlanSfpa: this.servicioSeleccionado.idPlanSfpa}});
  }

  cancelarPago(): void {
    void this.router.navigate(['servicios-funerarios/cancelar-pago'],
      {queryParams: {idPlanSfpa: this.servicioSeleccionado.idPlanSfpa}});
  }

  modificarPago(): void {
    void this.router.navigate(['servicios-funerarios/modificar-pago'],
      {queryParams: {idPlanSfpa: this.servicioSeleccionado.idPlanSfpa}});
  }

  validarEstatusPlan(): boolean {
    return !this.servicioSeleccionado.estatusPlan?.toUpperCase().includes('CANCELADO');
  }

  validarEstatusPlanModificar(): boolean {
    return !['CANCELADO', 'PRE-REGISTRO'].includes(this.servicioSeleccionado.estatusPlan?.toUpperCase() || '');
  }
}
