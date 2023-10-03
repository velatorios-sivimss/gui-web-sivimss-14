import {BalanceCaja} from '../../models/balance-caja.interface';
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
import {BalanceCajaService} from '../../services/balance-caja.service';
import {ActivatedRoute} from '@angular/router';
import {FiltrosBalanceCaja} from "../../models/filtros-balance-caja.interface";
import {finalize} from "rxjs/operators";
import {of} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {
  mapearArregloTipoDropdown, obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado,
  validarUsuarioLogueado
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import {RealizarCierreComponent} from '../realizar-cierre/realizar-cierre.component';
import {TIPO_CONVENIOS} from "../../constants/convenios";
import {TIPO_PAGO} from "../../constants/tipos-pago";
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {DatePipe} from '@angular/common';

type ListadoBalanceCaja = Required<BalanceCaja> & { id: string }

@Component({
  selector: 'app-balance-caja',
  templateUrl: './balance-caja.component.html',
  styleUrls: ['./balance-caja.component.scss'],
  providers: [DialogService, DescargaArchivosService, DatePipe]
})
export class BalanceCajaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  totalIngresos: number = 0;
  totalImporte: number = 0;

  balanceCaja: BalanceCaja[] = [];
  balanceCajaSeleccionado!: BalanceCaja;
  filtroFormBalanceCaja!: FormGroup;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  tipoConvenio: TipoDropdown[] = TIPO_CONVENIOS;
  opciones: TipoDropdown[] = TIPO_PAGO;

  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();
  ventanaConfirmacion: boolean = false;
  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;
  convenioSeleccionado: number | null = null;
  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;
  esModificacion: boolean = true;
  rol: any;
  mostrarModalDescargaExitosa: boolean = false;
  MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  central!: boolean;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private balanceCajaService: BalanceCajaService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
    private datePipe: DatePipe
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.rol = +usuario.idRol;
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catatalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    this.catatalogoDelegaciones = [{value: null, label: 'Todos'}, ...this.catatalogoDelegaciones];
    this.obtenerVelatorios(true);
  }

  abrirPanel(event: MouseEvent, balanceCajaSeleccionado: BalanceCaja): void {
    this.balanceCajaService.balanceSeleccionado = balanceCajaSeleccionado;
    this.balanceCajaSeleccionado = balanceCajaSeleccionado;
    this.validarFecha();
    this.overlayPanel.toggle(event);
  }

  validarFecha() {
    const fechaSeleccionada = new Date(this.filtroFormBalanceCaja.get('fecha')?.value);
    const fechaHoy = new Date();
    // Elimina las horas, minutos, segundos y milisegundos de la fecha de hoy
    fechaHoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada.getTime() === fechaHoy.getTime()) {
      console.log('La fecha es del día actual.');
      this.esModificacion = true;
    } else if (fechaSeleccionada.getTime() < fechaHoy.getTime()) {
      console.log('La fecha es menor al día de hoy.');
      this.esModificacion = false;
    } else {
      console.log('La fecha es mayor al día de hoy.');
    }
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroFormBalanceCaja = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      delegacion: [{
        value: this.central ? null : obtenerDelegacionUsuarioLogueado(usuario),
        disabled: +usuario.idOficina > 1
      }],
      velatorio: [{
        value: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      folioODS: [{value: null, disabled: false}],
      folioNuevo: [{value: null, disabled: false}],
      folioRenovacion: [{value: null, disabled: false}],
      fecha: [{value: null, disabled: false}],
      metodo: [{value: null, disabled: false}],
    });
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
    let filtros: FiltrosBalanceCaja = this.crearSolicitudFiltros();
    delete filtros.tipoReporte;
    if (filtros.fecha === null) {
      filtros.fecha = this.datePipe.transform(new Date(), 'YYYY-MM-dd')
    }
    this.balanceCajaService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.balanceCaja = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
        this.totalIngresos = respuesta.datos.content[0].totalIngreso ?? 0;
        this.totalImporte = respuesta.datos.content[0].totalImporte ?? 0;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  paginarConFiltros(): void {
    let filtros: FiltrosBalanceCaja = this.crearSolicitudFiltros();
    delete filtros.tipoReporte;
    this.cargadorService.activar();
    this.balanceCajaService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.balanceCaja = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
        this.totalIngresos = respuesta.datos.content[0].totalIngreso ?? 0;
        this.totalImporte = respuesta.datos.content[0].totalImporte ?? 0;
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

  crearSolicitudFiltros(): FiltrosBalanceCaja {
    return {
      idNivel: this.filtroFormBalanceCaja.get("nivel")?.value === "" ? null : this.filtroFormBalanceCaja.get("nivel")?.value,
      idDelegacion: this.filtroFormBalanceCaja.get("delegacion")?.value === "" ? null : this.filtroFormBalanceCaja.get("delegacion")?.value,
      idVelatorio: this.filtroFormBalanceCaja.get("velatorio")?.value === "" ? null : this.filtroFormBalanceCaja.get("velatorio")?.value,
      idTipoConvenio: this.convenioSeleccionado,
      folioODS: this.filtroFormBalanceCaja.get("folioODS")?.value,
      folioNuevoConvenio: this.filtroFormBalanceCaja.get("folioNuevo")?.value,
      folioRenovacionConvenio: this.filtroFormBalanceCaja.get("folioRenovacion")?.value,
      fecha: this.datePipe.transform(this.filtroFormBalanceCaja.get("fecha")?.value, 'YYYY-MM-dd'),
      idMetodoPago: this.filtroFormBalanceCaja.get("metodo")?.value === "" ? null : this.filtroFormBalanceCaja.get("metodo")?.value
    }
  }

  limpiar(): void {
    this.filtroFormBalanceCaja.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (this.filtroFormBalanceCaja) {
      const formularioDefault = {
        nivel: +usuario?.idOficina,
        delegacion: this.central ? null : obtenerDelegacionUsuarioLogueado(usuario),
        velatorio: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
      }
      this.filtroFormDir.resetForm(formularioDefault);
    }
    this.convenioSeleccionado = null;
    this.totalElementos = 0;
    this.totalIngresos = 0;
    this.totalImporte = 0;
    this.obtenerVelatorios(true);
    this.paginar();
  }

  obtenerVelatorios(cargaInicial: boolean = false): void {
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroFormBalanceCaja.get('velatorio')?.patchValue("");
    }
    const idDelegacion = this.filtroFormBalanceCaja.get('delegacion')?.value;
    this.balanceCajaService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        this.catalogoVelatorios = [{value: null, label: 'Todos'}, ...this.catalogoVelatorios];
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    this.cargadorService.activar();
    const busqueda = this.crearSolicitudFiltros();
    busqueda.tipoReporte = tipoReporte;
    this.balanceCajaService.generarReporte(busqueda).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const file = new Blob([this.descargaArchivosService.base64_2Blob(
            respuesta.datos, this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)}
        );
        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.cargadorService.desactivar())
        ).subscribe({
          next: (repuesta): void => {
            if (respuesta) this.mostrarModalDescargaExitosa = true;
          },
          error: (error): void => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        })
      },
      error: (error: HttpErrorResponse): void => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, msg);
      }
    })
  }

  abrirModalCierre(): void {
    let filtros: FiltrosBalanceCaja = this.crearSolicitudFiltros();
    delete filtros.tipoReporte;
    if (filtros.fecha === null) {
      filtros.fecha = this.datePipe.transform(new Date(), 'YYYY-MM-dd')
    }
    this.balanceCajaService.filtrosBalanceSeleccionados = filtros;
    this.modificacionRef = this.dialogService.open(RealizarCierreComponent, {
      header: 'Cierre',
      width: '520px'
    });

    this.modificacionRef.onClose.subscribe(() => {
      this.paginar();
    })
  }

  cerrar(): void {
    this.modificacionRef.close();
  }

  get f() {
    return this.filtroFormBalanceCaja?.controls;
  }

}
