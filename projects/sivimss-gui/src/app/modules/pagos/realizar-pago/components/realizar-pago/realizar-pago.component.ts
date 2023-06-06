import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {REALIZAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {REGISTROS_PAGOS} from "../../constants/dummies";
import {OverlayPanel} from "primeng/overlaypanel";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {validarUsuarioLogueado} from "../../../../../utils/funciones";
import {Pago} from "../../modelos/pago.interface";
import {FiltrosPago} from "../../modelos/filtrosPago.interface";

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
  velatorios: TipoDropdown[] = [];
  pagos: Pago[] = [];

  realizarPagoModal: boolean = false;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}, []],
      velatorio: [{value: null, disabled: false}, []],
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

  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);

  }

  guardarPDF(): void {

  }

  guardarExcel(): void {

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
      fechaFin: "",
      fechaInicio: "",
      idVelatorio: 0,
      nomContratante: ""
    }
  }
}
