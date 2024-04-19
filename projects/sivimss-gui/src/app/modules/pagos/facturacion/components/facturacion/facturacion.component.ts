import {Component, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup, FormGroupDirective} from "@angular/forms";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {LazyLoadEvent} from "primeng/api";
import {FACTURACION_BREADCRUMB} from "../../constants/breadcrumb";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {VerDetalleFacturaComponent} from "../ver-detalle-factura/ver-detalle-factura.component";
import * as moment from "moment";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {
  mapearArregloTipoDropdown,
  obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado, validarUsuarioLogueado
} from "../../../../../utils/funciones";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {FacturacionService} from "../../services/facturacion.service";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {FiltrosFacturacion} from "../../models/filtrosFacturacion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {AutenticacionService} from "../../../../../services/autenticacion.service";

interface RegistroFacturacion {
  contratante: string,
  estatusFactura: string,
  fechaFactura: string,
  folio: string,
  folioFactura: number,
  importe: number,
  rfc: string,
  folioFiscal: string,
  nomVelatorio: string
}

interface ParamsCancelar {
  folioFactura: number,
  folioFiscal: string,
  folioRelacionado: string
}

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.scss'],
  providers: [DialogService, DescargaArchivosService, AutenticacionService]
})
export class FacturacionComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  detalleRef!: DynamicDialogRef;

  velatorios: TipoDropdown[] = [];
  filtroForm!: FormGroup;
  registros: RegistroFacturacion[] = [];
  registroSeleccionado!: RegistroFacturacion;
  tipoPago: number | null = null;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  mostrarModalDescargaExitosa: boolean = false;
  rol!: number;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private alertaService: AlertaService,
    private facturacionService: FacturacionService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
    private route: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
    private authService: AutenticacionService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.rol = +usuario.idRol;
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(FACTURACION_BREADCRUMB);
    this.inicializarFiltroForm();
    this.obtenerVelatorios();
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.filtroForm = this.formBuilder.group({
      velatorio: [{
        value: obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      ods: [{value: null, disabled: false}],
      folioConvenio: [{value: null, disabled: false}],
      numeroPermiso: [{value: null, disabled: false}],
      folioFactura: [{value: null, disabled: false}],
      folioFiscal: [{value: null, disabled: false}],
      rfc: [{value: null, disabled: false}],
      periodoInicio: [{value: null, disabled: false}],
      periodoFin: [{value: null, disabled: false}],
    })
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroForm.get('periodoInicio')?.value;
    const fechaFinal = this.filtroForm.get('periodoFin')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroForm.get('periodoInicio')?.patchValue(null);
    this.filtroForm.get('periodoFin')?.patchValue(null);
  }

  limpiarFolios(folio: 1 | 2): void {
    this.tipoPago = folio;
    if (folio === 1) {
      this.filtroForm.get('folioConvenio')?.patchValue(null);
      return;
    }
    this.filtroForm.get('ods')?.patchValue(null);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    if (this.filtroForm) {
      const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
      this.filtroFormDir.resetForm({velatorio: obtenerVelatorioUsuarioLogueado(usuario)});
    }
    this.tipoPago = null;
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
    } else {
      this.paginar();
    }
  }

  paginarConFiltros(): void {
    const filtros = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.facturacionService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registros = respuesta.datos.content;
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
    this.facturacionService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registros = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      },
    });
  }

  crearSolicitudFiltros(): FiltrosFacturacion {
    let folio: string | null = null;
    if (this.tipoPago === 1) folio = this.filtroForm.get('ods')?.value;
    if (this.tipoPago === 2) folio = this.filtroForm.get('folioConvenio')?.value;
    let fechaFin = this.filtroForm.get('periodoFin')?.value;
    if (fechaFin) fechaFin = moment(fechaFin).format('YYYY-MM-DD');
    let fechaInicio = this.filtroForm.get('periodoInicio')?.value;
    if (fechaInicio) fechaInicio = moment(fechaInicio).format('YYYY-MM-DD');
    return {
      fechaFin,
      fechaInicio,
      folio,
      folioFactura: this.filtroForm.get('folioFactura')?.value,
      folioFiscal: this.filtroForm.get('folioFiscal')?.value,
      idFlujoPagos: this.tipoPago,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      rfc: this.filtroForm.get('rfc')?.value
    };
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.facturacionService.obtenerCatalogoVelatorios(usuario?.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.velatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  abrirPanel(event: MouseEvent, registro: any): void {
    this.overlayPanel.toggle(event);
    this.registroSeleccionado = registro;
  }

  abrirModalDetalleFacturacion(): void {
    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: "Ver detalle",
      width: MAX_WIDTH,
    }
    this.detalleRef = this.dialogService.open(VerDetalleFacturaComponent, DETALLE_CONFIG);
  }

  cancelarFactura(): void {
    const datos_cancelar: string = window.btoa(JSON.stringify(this.crearParamsCancelar()));
    void this.router.navigate(['./cancelar-factura'],
      {relativeTo: this.route, queryParams: {datos_cancelar}});
  }

  enviarFactura(): void {
    const datos_enviar: string = window.btoa(JSON.stringify(this.crearParamsCancelar()));
    void this.router.navigate(['./enviar-factura'],
      {relativeTo: this.route, queryParams: {datos_enviar}});
  }

  crearParamsCancelar(): ParamsCancelar {
    return {
      folioFactura: this.registroSeleccionado.folioFactura,
      folioFiscal: this.registroSeleccionado.folioFiscal,
      folioRelacionado: this.registroSeleccionado.folio
    }
  }

  descargarFactura(): void {
    const {folioFactura} = this.registroSeleccionado;
    this.cargadorService.activar();
    this.descargaArchivosService.descargarArchivo(this.facturacionService.generarFactura(folioFactura)).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: boolean): void => {
        if (respuesta) this.mostrarModalDescargaExitosa = true;
      },
      error: (error): void => {
        console.log(error)
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }
}
