import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective, Validators} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DialogService} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import * as moment from "moment";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {
  mapearArregloTipoDropdown,
  obtenerDelegacionUsuarioLogueado,
  obtenerNivelUsuarioLogueado, obtenerVelatorioUsuarioLogueado
} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {ReportesService} from "../../services/reportes.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {TIPO_ARCHIVO} from "../../constants/tipo-archivo";
import {of} from "rxjs";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
  providers: [DescargaArchivosService]
})
export class Reportes implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  MENSAJE_FILTROS: string = 'Selecciona por favor un criterio de búsqueda.';
  mostrarModalFiltros: boolean = false;

  validaciones: Map<number, any> = new Map();
  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;

  filtroForm!: FormGroup;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  niveles: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];
  velatorios: TipoDropdown[] = [];
  tipoODS: TipoDropdown[] = [
    {value: 1, label: 'servicio normal'},
    {value: 2, label: 'siniestros de previsión funeraria'},
    {value: 3, label: 'ambos'}
  ];
  tipoReporte: TipoDropdown[] = [
    {value: 1, label: 'Reportes'},
    {value: 2, label: 'Previsiones funerarias'}
  ]
  reportes!: TipoDropdown[];

  filtroODS!: TipoDropdown[];
  listaODS: any;

  promotor!: TipoDropdown[];

  anio!: TipoDropdown[];
  mes!: TipoDropdown[];
  exportar: TipoDropdown[] = [];
  tipoODSBandera: boolean = false;
  numeroODSBandera: boolean = false;
  promotorBandera: boolean = false;
  anioBandera: boolean = false;
  mesBandera: boolean = false;
  fechaInicialBandera: boolean = false;
  fechaFinalBandera: boolean = false;
  banderaEstatusODS: boolean = false;
  estatusSeleccionODS!: number | null;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private reporteOrdenServicioService: ReportesService,
    private descargaArchivosService: DescargaArchivosService,
  ) {
    /*
    * 1	Reporte de órdenes de servicio
      2	Concentrado de Facturas
      3	Reporte resumen pago proveedor
      4	Reporte detalle pago
      5	Reporte detalle importe-servicios
      6	Reporte de Comisiones de Promotores
      7	Reporte de servicios velatorio
      8	Concentrado de Siniestros de Previsión Funeraria
      9	Concentrado de Servicios Pago Anticipado
    */
    this.validaciones.set(1, () => this.validacionesOrdenesServicio())
    this.validaciones.set(3, () => this.validacionesResumenPagoProveedor())
    this.validaciones.set(4, () => this.validacionesDetallePago())
    this.validaciones.set(5, () => this.validacionesDetalleImporteServicios())
    this.validaciones.set(6, () => this.validacionesComisionesPromotores())
    this.validaciones.set(7, () => this.validacionesServiciosVelatorios())
    this.validaciones.set(8, () => this.validacionesConcentradoSiniestrosPF())
    this.validaciones.set(9, () => this.validacionesConcentradoServicioPA())
  }

  fechaActual = new Date();
  mostrarModalFechaMayor: boolean = false;
  fechaRango = moment().subtract(10, 'years').toDate();

  ngOnInit(): void {
    this.breadcrumbService.limpiar();
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarForm();
    this.inicializarCatalogos();
  }

  inicializarForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: number | null = obtenerDelegacionUsuarioLogueado(usuario);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    this.filtroForm = this.formBuilder.group({
      tipoReporte: [{value: null, disabled: false}, [Validators.required]],
      reporte: [{value: null, disabled: false}, [Validators.required]],
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      delegacion: [{value: delegacion, disabled: +this.rolLocalStorage.idOficina >= 2}],
      velatorio: [{value: velatorio, disabled: +this.rolLocalStorage.idOficina === 3}],
      idTipoODS: [{value: null, disabled: false}],
      idEstatusODS: [{value: null, disabled: false}],
      fechaIni: [{value: null, disabled: false}],
      fechaFin: [{value: null, disabled: false}],
      numeroOds: [{value: null, disabled: false}],
      promotor: [{value: null, disabled: false}],
      anio: [{value: null, disabled: false}],
      mes: [{value: null, disabled: false}],
      exportar: [{value: null, disabled: false}, [Validators.required]],
      preorden: [{value: null, disabled: false}],
      generada: [{value: null, disabled: false}],
      cancelada: [{value: null, disabled: false}],
      pagada: [{value: null, disabled: false}],
      enTransito: [{value: null, disabled: false}],
      concluida: [{value: null, disabled: false}],
      todos: [{value: null, disabled: false}],
    })
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    const DELEGACION: TipoDropdown[] = [{label: 'Todos', value: null}];
    this.niveles = respuesta[this.POSICION_NIVELES];
    this.delegaciones = [...DELEGACION, ...respuesta[this.POSICION_DELEGACIONES]];
    this.cambiarDelegacion(true);
  }

  seleccionarValidaciones(): void {
    const tipoSolicitud: number = this.filtroForm.get('reporte')?.value as number;
    if (!this.validaciones.has(tipoSolicitud)) return;
    this.validaciones.get(tipoSolicitud)();
  }

  validarFechaFinal(): void {
    if (!this.ff.fechaIni?.value || !this.ff.fechaFin?.value) {
      return
    }
    if (this.ff.fechaIni.value > this.ff.fechaFin.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  cambiarDelegacion(configuracionInicial: boolean = false): void {
    if (configuracionInicial) this.filtroForm.get('velatorio')?.patchValue(null);
    const delegacion = this.filtroForm.get('delegacion')?.value;
    this.velatorios = [];
    if (!delegacion) return;
    this.loaderService.activar();
    this.reporteOrdenServicioService.obtenerCatalogoVelatoriosPorDelegacion(delegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        respuesta.datos.push({"idVelatorio": null, "nomVelatorio": "Todos"})
        this.velatorios = mapearArregloTipoDropdown(respuesta.datos, "nomVelatorio", "idVelatorio");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error)
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  estatusODS(estatusODS: number | null): void {
    let listadoEstatus = ['preorden', 'generada', 'cancelada', 'pagada', 'enTransito', 'concluida', 'todos'];
    if (estatusODS != 1) this.ff.preorden.reset()
    if (estatusODS != 2) this.ff.generada.reset()
    if (estatusODS != 0) this.ff.cancelada.reset()
    if (estatusODS != 4) this.ff.pagada.reset()
    if (estatusODS != 3) this.ff.enTransito.reset()
    if (estatusODS != 6) this.ff.concluida.reset()
    if (estatusODS != null) this.ff.todos.reset()
    this.estatusSeleccionODS = estatusODS;
  }

  limpiarFiltros(): void {
    this.cambiarReporte();
    this.cambiarDelegacion(true);
    this.exportar = [];
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormDir.resetForm({
      nivel: obtenerNivelUsuarioLogueado(usuario),
      delegacion: obtenerDelegacionUsuarioLogueado(usuario),
      velatorio: obtenerVelatorioUsuarioLogueado(usuario)
    });
  }

  exportarReporte(): void {
    /*
    * 1	Reporte de órdenes de servicio
      2	Concentrado de Facturas
      3	Reporte resumen pago proveedor
      4	Reporte detalle pago
      5	Reporte detalle importe-servicios
      6	Reporte de Comisiones de Promotores
      7	Reporte de servicios velatorio
      8	Concentrado de Siniestros de Previsión Funeraria
      9	Concentrado de Servicios Pago Anticipado
    */
    if (!this.validarFiltros()) return;
    this.loaderService.activar();
    const filtros = this.consultarFiltros(this.ff.reporte.value);
    const configuracionArchivo: OpcionesArchivos = {};
    if (filtros.tipoReporte.includes("xls")) {
      configuracionArchivo.ext = "xlsx"
    }
    let tipoReporte: TipoDropdown[] = [
      {
        label: '/genera-reporte-ods',
        value: 1
      }
    ]
    let nombreReporte: string = "";
    tipoReporte.forEach(element => {
      if (element.value == this.ff.tipoReporte.value) {
        nombreReporte = element.label;
      }
    });
    this.reporteOrdenServicioService.generarReporte(filtros, nombreReporte).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())
        ).subscribe(
          (repuesta) => {
            //TODO verificar si se necesita agregar mensaje de confirmación
          },
          (error) => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        )
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(5));
      }
    });
  }

  validarFiltros(): boolean {
    const form = this.filtroForm.getRawValue();
    const valores: string[] = Object.values(form);
    if (valores.some(v => v !== null)) {
      return true;
    }
    this.mostrarModalFiltros = true;
    return false;
  }

  consultarFiltros(tipoReporte: number): any {
    switch (this.ff.reporte.value) {
      case 1:
        return {
          idVelatorio: this.ff.velatorio.value,
          idDelegacion: this.ff.delegacion.value,
          idTipoODS: this.ff.idTipoODS.value,
          idEstatusODS: this.estatusSeleccionODS,
          fechaIni: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('YYYY-MM-DD') : null,
          fechaFin: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('YYYY-MM-DD') : null,
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls',
        }
        break;
      case 2:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 3:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 5:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 6:
        this.numeroODSBandera = true;
        this.promotorBandera = true;
        this.anioBandera = true;
        this.mesBandera = true;
        break;
      case 7:
        this.numeroODSBandera = true;
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 8:
        this.numeroODSBandera = true;
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 9:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;

    }
  }

  filtrarODS(): void {
    let query = this.obtenerNombreContratantesDescripcion();
    let filtered: any[] = [];
    if (query?.length < 3) return;
    for (let i = 0; i < (this.listaODS as any[]).length; i++) {
      let ods = (this.listaODS as any[])[i];
      if (ods.folioODS?.toLowerCase().indexOf(query.toLowerCase()) == 0) {

        filtered.push({label: "", value: ""});
      }
    }
    this.filtroODS = filtered;
  }

  obtenerNombreContratantesDescripcion(): string {
    let query = this.ff.numeroOds?.value || '';
    if (typeof this.ff.numeroOds?.value === 'object') {
      query = this.ff.numeroOds?.value?.label;
    }
    return query?.toLowerCase();
  }

  cambiarReporte(): void {
    this.seleccionarValidaciones();
    this.exportar = this.limpiarTiposExportacion();

    this.tipoODSBandera = false;
    this.numeroODSBandera = false;
    this.promotorBandera = false;
    this.anioBandera = false;
    this.mesBandera = false;
    this.fechaInicialBandera = false;
    this.fechaFinalBandera = false;
    this.banderaEstatusODS = false;
    this.filtroForm.clearValidators();
    this.filtroForm.updateValueAndValidity();

    switch (this.ff.reporte.value) {
      case 1:
        this.reporteOrdenesServicios();
        break;
      case 5:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 6:
        this.numeroODSBandera = true;
        this.promotorBandera = true;
        this.anioBandera = true;
        this.mesBandera = true;
        break;
      case 7:
        this.numeroODSBandera = true;
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 8:
        this.numeroODSBandera = true;
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      case 9:
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
        break;
      default:
        break;
    }
  }

  cambiarTipoReporte(): void {
    this.cambiarReporte();
    this.loaderService.activar()
    this.reporteOrdenServicioService.consultarTipoReportes(this.ff.tipoReporte.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {

        this.reportes = mapearArregloTipoDropdown(respuesta.datos.reportes, 'nombreReporte', 'idReporte');
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    });
  }

  reporteOrdenesServicios(): void {
    this.tipoODSBandera = true;
    this.banderaEstatusODS = true;
    this.fechaInicialBandera = true;
    this.fechaFinalBandera = true;
    this.ff.idEstatusODS.setValidators(Validators.required);
    this.ff.idEstatusODS.updateValueAndValidity();
  }

  validacionesGenerales(): void {

  }

  validacionesOrdenesServicio(): void {

  }

  validacionesConcentradoFacturas(): void {

  }

  validacionesResumenPagoProveedor(): void {

  }

  validacionesDetallePago(): void {

  }

  validacionesDetalleImporteServicios(): void {

  }

  validacionesComisionesPromotores(): void {

  }

  validacionesServiciosVelatorios(): void {

  }

  validacionesConcentradoSiniestrosPF(): void {

  }

  validacionesConcentradoServicioPA(): void {

  }

  get idReporte(): number {
    return this.filtroForm.get('reporte')?.value
  }

  get ff() {
    return this.filtroForm.controls;
  }

  limpiarTiposExportacion(): TipoDropdown[] {
    const ARCHIVO: TipoDropdown[] = [...TIPO_ARCHIVO];
    if ([3].includes(this.idReporte)) return ARCHIVO;
    ARCHIVO.pop();
    return ARCHIVO;
  }
}
