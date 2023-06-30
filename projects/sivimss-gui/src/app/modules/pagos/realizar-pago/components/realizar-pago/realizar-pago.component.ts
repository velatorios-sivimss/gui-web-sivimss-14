import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
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
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from "../../../../../utils/funciones";
import {Pago} from "../../modelos/pago.interface";
import {FiltrosPago} from "../../modelos/filtrosPago.interface";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.scss']
})
export class RealizarPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_FOLIO_ODS: number = 1;
  readonly POSICION_FOLIO_PREV_FUN: number = 2;
  readonly POSICION_FOLIO_REN_PREV_FUN: number = 3;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  filtroForm!: FormGroup;
  catalogoNiveles: TipoDropdown[] = [];
  pagos: Pago[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();
  pagoSeleccionado!: Pago;

  habilitaIrPago: string[] = ['Generada', 'Vigente'];
  habilitaIrPagoEstatus: string[] = ['Pendiente', 'Generado']
  habilitaModificar: string[] = ['Pagada'];
  habilitaModificarPago: string[] = ['Pagado'];

  foliosODS: TipoDropdown[] = [];
  foliosPrevFun: TipoDropdown[] = [];
  foliosRevPrevFun: TipoDropdown[] = [];

  tipoFolio: null | 1 | 2 | 3 = null;

  realizarPagoModal: boolean = false;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private alertaService: AlertaService,
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.cargarCatalogos();
    this.inicializarForm();
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
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: true}],
      velatorio: [{value: +usuario.idVelatorio, disabled: +usuario.idRol === 3}],
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
    if (this.filtroForm) {
      this.filtroForm.reset();
      this.tipoFolio = null;
      const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
      this.filtroForm.get('nivel')?.patchValue(+usuario.idRol);
      this.filtroForm.get('velatorio')?.patchValue(+usuario.idVelatorio);
    }
    this.numPaginaActual = 0;
    this.paginar();
  }

  abrirModalPago(): void {
    this.realizarPagoModal = !this.realizarPagoModal;
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

  abrirModalDetallePago(pago: any): void {
    console.log(pago);
  }

  abrirPanel(event: MouseEvent, pago: Pago): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  guardarPDF(): void {
    console.log();
  }

  guardarExcel(): void {
    console.log();
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
      folio = this.filtroForm.get('folioOrden')?.value;
    }
    if (this.tipoFolio === 2) {
      folio = this.filtroForm.get('folioConvenio')?.value;
    }
    if (this.tipoFolio === 3) {
      folio = this.filtroForm.get('folioRenovacion')?.value;
    }
    const velatorio = this.filtroForm.get('velatorio')?.value
    return {
      folio,
      fechaFin: this.filtroForm.get('periodoFin')?.value,
      fechaInicio: this.filtroForm.get('periodoInicio')?.value,
      idVelatorio: velatorio === 0 ? null : velatorio,
      nomContratante: this.filtroForm.get('nombreContratante')?.value,
      idFlujoPagos: this.tipoFolio
    }
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.realizarPagoService.obtenerVelatoriosPorDelegacion(usuario.idDelegacion).subscribe({
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
      this.filtroForm.get('folioConvenio')?.patchValue(null);
      this.filtroForm.get('folioRenovacion')?.patchValue(null);
      return;
    }
    if (folio === 2) {
      this.filtroForm.get('folioOrden')?.patchValue(null);
      this.filtroForm.get('folioRenovacion')?.patchValue(null);
      return;
    }
    this.filtroForm.get('folioOrden')?.patchValue(null);
    this.filtroForm.get('folioConvenio')?.patchValue(null);
  }

  redireccionPago(): void {
    if (this.pagoSeleccionado.tipoPago === 'Orden de Servicio') {
      void this.router.navigate(["./pago-orden-servicio"], {relativeTo: this.activatedRoute});
      return;
    }
    if (this.pagoSeleccionado.tipoPago === 'Nuevos Convenios de Previsión Funeraria') {
      void this.router.navigate(["./pago-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
      return;
    }
    void this.router.navigate(["./pago-renovacion-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
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

  get fP() {
    return this.filtroForm?.controls;
  }

  modificarPago(): void {
    void this.router.navigate(["./modificar-metodo-de-pago", this.pagoSeleccionado.idPagoBitacora],
      {relativeTo: this.activatedRoute});
  }
}
