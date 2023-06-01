import {ReciboPago} from '../../models/recibo-pago.interface';
import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {CATALOGOS_DUMMIES} from '../../constants/dummies';
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
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";

type ListadoRecibo = Required<ReciboPago> & { idPagoBitacora: string }

@Component({
  selector: 'app-generar-recibo-pago',
  templateUrl: './generar-recibo-pago.component.html',
  styleUrls: ['./generar-recibo-pago.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarReciboPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  recibosPago: ReciboPago[] = [];
  reciboPagoSeleccionado!: ListadoRecibo;
  filtroForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  fechaActual: Date = new Date();

  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;
  readonly POSICION_CATALOGO_VELATORIOS: number = 2;
  readonly ERROR_DESCARGA_ARCHIVO: string = "Error al guardar el archivo";
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarReciboService: GenerarReciboService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
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
  }

  abrirPanel(event: MouseEvent, reciboPagoSeleccionado: ListadoRecibo): void {
    this.reciboPagoSeleccionado = reciboPagoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalReciboPagoTramites(): void {
    this.router.navigate(['generar-recibo-pago-tramites'], {
      relativeTo: this.activatedRoute,
      queryParams: {idPagoBitacora: this.reciboPagoSeleccionado.idPagoBitacora}
    });
  }

  async inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: +this.rolLocalStorage.idRol || null, disabled: +this.rolLocalStorage.idRol >= 1}],
      delegacion: [{value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idRol >= 2}],
      velatorio: [{value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idRol === 3}],
      folio: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
    await this.obtenerVelatorios();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {

    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginar(): void {
    this.cargadorService.activar();
    this.generarReciboService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          this.recibosPago = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }

  paginarConFiltros(): void {
    const filtros: FiltrosReciboPago = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.generarReciboService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          this.recibosPago = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosReciboPago {
    return {
      idNivel: this.filtroForm.get("nivel")?.value,
      idDelegacion: this.filtroForm.get("delegacion")?.value,
      idVelatorio: this.filtroForm.get("velatorio")?.value,
      claveFolio: this.filtroForm.get("folio")?.value,
      nomContratante: this.filtroForm.get("nombreContratante")?.value,
      fecIniODS: this.filtroForm.get("fechaInicial")?.value,
      fecFinODS: this.filtroForm.get("fechaFinal")?.value,
      rutaNombreReporte: "reportes/generales/ReporteFiltrosRecPagos.jrxml",
      tipoReporte: "pdf"
    }
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.paginar();

    this.f.nivel.setValue(+this.rolLocalStorage.idRol || null);

    if (+this.rolLocalStorage.idRol >= 2) {
      this.f.delegacion.setValue(+this.rolLocalStorage.idDelegacion || null);
    }

    if (+this.rolLocalStorage.idRol === 3) {
      this.f.velatorio.setValue(+this.rolLocalStorage.idVelatorio || null);
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }

  async obtenerVelatorios() {
    this.generarReciboService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe(
      (respuesta) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta!.datos, "desc", "id");
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    );
  }

  guardarListadoPagosPDF() {
    this.cargadorService.activar();
    const filtros: FiltrosReciboPago = this.crearSolicitudFiltros();
    this.descargaArchivosService.descargarArchivo(this.generarReciboService.descargarListadoPDF(filtros)).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta)
      },
      (error) => {
        console.log(error)
      },
    )
  }

  guardarListadoPagosExcel() {
    this.cargadorService.activar();
    const filtros: FiltrosReciboPago = this.crearSolicitudFiltros();
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: "reporte", ext: "xlsx"}
    this.descargaArchivosService.descargarArchivo(this.generarReciboService.descargarListadoExcel(),
      configuracionArchivo).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta): void => {
        console.log(respuesta)
      },
      error: (error): void => {
        this.mensajesSistemaService.mostrarMensajeError(error.message, this.ERROR_DESCARGA_ARCHIVO);
        console.log(error)
      },
    })
  }

}
