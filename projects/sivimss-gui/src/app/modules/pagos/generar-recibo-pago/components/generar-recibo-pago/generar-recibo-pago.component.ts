import {ReciboPago} from '../../models/recibo-pago.interface';
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
import {GenerarReciboService} from '../../services/generar-recibo-pago.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltrosReciboPago} from "../../models/filtrosReciboPago.interface";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import * as moment from "moment/moment";

type ListadoRecibo = Required<ReciboPago> & { idPagoBitacora: string }

@Component({
  selector: 'app-generar-recibo-pago',
  templateUrl: './generar-recibo-pago.component.html',
  styleUrls: ['./generar-recibo-pago.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarReciboPagoComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  recibosPago: ReciboPago[] = [];
  reciboPagoSeleccionado!: ReciboPago;
  filtroFormReciboPago!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoFolios: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarReciboService: GenerarReciboService,
    private router: Router,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catatalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    this.obtenerVelatorios();
  }

  abrirPanel(event: MouseEvent, reciboPagoSeleccionado: ListadoRecibo): void {
    this.reciboPagoSeleccionado = reciboPagoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormReciboPago = this.formBuilder.group({
      nivel: [{value: +usuario?.idOficina, disabled: true}],
      delegacion: [{value: +usuario?.idDelegacion, disabled: +usuario.idOficina > 1}],
      velatorio: [{value: +usuario?.idVelatorio, disabled: +usuario.idOficina === 3}],
      folio: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
    this.obtenerFolios();
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroFormReciboPago.get('fechaInicial')?.value;
    const fechaFinal = this.filtroFormReciboPago.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroFormReciboPago.get('fechaInicial')?.patchValue(null);
    this.filtroFormReciboPago.get('fechaFinal')?.patchValue(null);
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
    const filtros = {
      idNivel: this.filtroFormReciboPago.get("nivel")?.value,
      idDelegacion: this.filtroFormReciboPago.get("delegacion")?.value,
      idVelatorio: this.filtroFormReciboPago.get("velatorio")?.value,
    }
    this.generarReciboService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.recibosPago = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosReciboPago = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.generarReciboService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.recibosPago = respuesta.datos.content;
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

  crearSolicitudFiltros(): FiltrosReciboPago {
    return {
      idNivel: this.filtroFormReciboPago.get("nivel")?.value,
      idDelegacion: this.filtroFormReciboPago.get("delegacion")?.value,
      idVelatorio: this.filtroFormReciboPago.get("velatorio")?.value,
      claveFolio: this.filtroFormReciboPago.get("folio")?.value,
      nomContratante: this.filtroFormReciboPago.get("nombreContratante")?.value,
      fecIniODS: this.filtroFormReciboPago.get("fechaInicial")?.value,
      fecFinODS: this.filtroFormReciboPago.get("fechaFinal")?.value,
      rutaNombreReporte: "reportes/generales/ReporteFiltrosRecPagos.jrxml",
      tipoReporte: "pdf"
    }
  }

  limpiar(): void {
    this.filtroFormReciboPago.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const DEFAULT = {
      nivel: +usuario?.idOficina,
      delegacion: +usuario?.idDelegacion,
      velatorio: usuario?.idVelatorio
    }
    this.filtroFormDir.resetForm(DEFAULT);
    this.obtenerVelatorios();
    this.paginar();
  }

  obtenerVelatorios(): void {
    const idDelegacion = this.filtroFormReciboPago.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.generarReciboService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  obtenerFolios(): void {
    const idVelatorio = this.filtroFormReciboPago.get('velatorio')?.value;
    this.catalogoFolios = [];
    this.filtroFormReciboPago.get('folio')?.patchValue(null);
    if (!idVelatorio) return;
    this.generarReciboService.obtenerFoliosODS(idVelatorio).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoFolios = mapearArregloTipoDropdown(respuesta.datos, "folioOds", "folioOds");
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    })
  }

  get f() {
    return this.filtroFormReciboPago?.controls;
  }

}
