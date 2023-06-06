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
import * as moment from "moment";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.scss']
})
export class RealizarPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  filtroForm!: FormGroup;
  catalogoNiveles: TipoDropdown[] = [];
  pagos: Pago[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  realizarPagoModal: boolean = false;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.cargarCatalogos();
    this.inicializarForm();
  }

  cargarCatalogos(): void {
    this.catalogoNiveles = this.route.snapshot.data["respuesta"];
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

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);
    console.log(pago)
  }

  guardarPDF(): void {
    console.log();
  }

  guardarExcel(): void {
    console.log();
  }

  private paginarConFiltros(): void {
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
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  private paginar(): void {
    this.cargadorService.activar();
    this.realizarPagoService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.pagos = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      },
    });
  }

  private crearSolicitudFiltros(): FiltrosPago {
    return {
      claveFolio: "",
      fechaFin: moment(this.filtroForm.get('periodoFin')?.value).format('YYYY-MM-DD'),
      fechaInicio: moment(this.filtroForm.get('periodoInicio')?.value).format('YYYY-MM-DD'),
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      nomContratante: this.filtroForm.get('nombreContratante')?.value
    }
  }

  private obtenerVelatorios(): void {
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
}
