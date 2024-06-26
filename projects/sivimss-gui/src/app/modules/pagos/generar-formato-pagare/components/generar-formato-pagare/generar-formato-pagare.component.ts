import {FormatoPagare} from '../../models/formato-pagare.interface';
import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {CATALOGOS_DUMMIES} from '../../constants/dummies';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {GenerarFormatoPagareService} from '../../services/generar-formato-pagare.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltrosFormatoPagare} from "../../models/filtrosFormatoPagare.interface";
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {finalize} from "rxjs/operators";
import {
  mapearArregloTipoDropdown,
  obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import * as moment from "moment/moment";

type ListadoFormato = Required<FormatoPagare> & { idODS: string }

@Component({
  selector: 'app-generar-formato-pagare',
  templateUrl: './generar-formato-pagare.component.html',
  styleUrls: ['./generar-formato-pagare.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarFormatoPagareComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  formatoPagare: FormatoPagare[] = [];
  formatoPagareSeleccionado!: ListadoFormato;
  filtroForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  paginacionConFiltrado: boolean = false;
  foliosGenerados: TipoDropdown[] = [];
  contratantesGenerados: TipoDropdown[] = [];

  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;

  readonly ERROR_DESCARGA_ARCHIVO: string = "Error al guardar el archivo";

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarFormatoService: GenerarFormatoPagareService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
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
    this.obtenerFoliosGenerados();
  }

  abrirPanel(event: MouseEvent, formatoPagareSeleccionado: ListadoFormato): void {
    this.formatoPagareSeleccionado = formatoPagareSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalformatoPagareTramites(): void {
    this.router.navigate(['generar-formato-pagare'], {
      relativeTo: this.activatedRoute,
      queryParams: {idODS: this.formatoPagareSeleccionado.id}
    });
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: nivel, disabled: true}],
      delegacion: [{value: obtenerDelegacionUsuarioLogueado(usuario), disabled: nivel > 1}],
      velatorio: [{value: obtenerVelatorioUsuarioLogueado(usuario), disabled: nivel === 3}],
      folioODS: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroForm.get('fechaInicial')?.value;
    const fechaFinal = this.filtroForm.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroForm.get('fechaInicial')?.patchValue(null);
    this.filtroForm.get('fechaFinal')?.patchValue(null);
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
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
    this.generarFormatoService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.formatoPagare = respuesta.datos.content || [];
          this.totalElementos = respuesta.datos.totalElements || 0;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosFormatoPagare = this.crearSolicitudFiltros("pdf");
    this.cargadorService.activar();
    this.generarFormatoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.formatoPagare = respuesta.datos.content || [];
          this.totalElementos = respuesta.datos.totalElements || 0;
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

  crearSolicitudFiltros(tipoReporte: string): FiltrosFormatoPagare {
    const fechaInicial = this.filtroForm.get('fechaInicial')?.value !== null ? moment(this.filtroForm.get('fechaInicial')?.value).format('DD/MM/YYYY') : null;
    const fechaFinal = this.filtroForm.get('fechaFinal')?.value !== null ? moment(this.filtroForm.get('fechaFinal')?.value).format('DD/MM/YYYY') : null;
    const folio = this.filtroForm.get("folioODS")?.value !== null ? this.filtroForm.get("folioODS")?.value.label : null;
    const nomContratante = this.filtroForm.get("nombreContratante")?.value !== null ? this.filtroForm.get("nombreContratante")?.value.label : null;
    return {
      idNivel: this.filtroForm.get("nivel")?.value,
      idDelegacion: this.filtroForm.get("delegacion")?.value,
      idVelatorio: this.filtroForm.get("velatorio")?.value,
      folioODS: folio,
      nomContratante: nomContratante,
      fecIniODS: fechaInicial,
      fecFinODS: fechaFinal,
      tipoReporte: tipoReporte
    }
  }

  limpiar(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const DEFAULT = {
      nivel: obtenerNivelUsuarioLogueado(usuario),
      delegacion: obtenerDelegacionUsuarioLogueado(usuario),
      velatorio: obtenerVelatorioUsuarioLogueado(usuario)
    }
    this.filtroFormDir.resetForm(DEFAULT);
    this.obtenerVelatorios();
    this.paginar();
  }


  obtenerFoliosGenerados(): void {
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    const idVelatorio = this.filtroForm.get('velatorio')?.value;
    this.foliosGenerados = [];
    this.contratantesGenerados = [];
    if (!idVelatorio) return;
    this.generarFormatoService.obtenerFoliosODS(idDelegacion, idVelatorio).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.foliosGenerados = mapearArregloTipoDropdown(respuesta.datos, "nombre", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    })
  }

  obtenerContratanteGeneradoPorfolio() {
    const idFolioODS = +this.f.folioODS.value.value;
    this.generarFormatoService.buscarContratantesGeneradosPorfolio(idFolioODS).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let filtrado: TipoDropdown[] = [];
        if (respuesta?.datos.length > 0) {
          respuesta?.datos.forEach((e: any) => {
            filtrado.push({
              label: e.nomContratante,
              value: e.nomContratante,
            });
          });
          this.contratantesGenerados = filtrado;
        } else {
          this.contratantesGenerados = [];
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  obtenerVelatorios(): void {
    this.foliosGenerados = [];
    this.catalogoVelatorios = [];
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.generarFormatoService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  get f() {
    return this.filtroForm?.controls;
  }

  guardarListadoPagaresPDF() {
    this.cargadorService.activar();
    const filtros: FiltrosFormatoPagare = this.crearSolicitudFiltros("pdf");
    const solicitudFiltros = JSON.stringify(filtros);
    this.descargaArchivosService.descargarArchivo(this.generarFormatoService.descargarListadoPagaresPDF(solicitudFiltros)).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        console.log(respuesta)
      },
      error: (error) => {
        console.log(error)
      },
    })
  }

  guardarListadoPagaresExcel() {
    this.cargadorService.activar();
    const filtros: FiltrosFormatoPagare = this.crearSolicitudFiltros("xls");
    const solicitudFiltros = JSON.stringify(filtros);
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: "reporte", ext: "xlsx"}
    this.descargaArchivosService.descargarArchivo(this.generarFormatoService.descargarListadoPagaresExcel(solicitudFiltros),
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
