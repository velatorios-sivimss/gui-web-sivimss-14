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
  obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado
} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {ReportesService} from "../../services/reportes.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {TIPO_ARCHIVO} from "../../constants/tipo-archivo";
import {of} from "rxjs";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {MESES} from "../../constants/meses";
import {Dropdown} from "primeng/dropdown";
import {NOMBRE_ENDPOINT, NOMBRE_REPORTES} from "../../constants/nombre-reportes";

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
  providers: [DescargaArchivosService]
})
export class Reportes implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  @ViewChild('velatorioDD') velatorioDD!: Dropdown;

  MENSAJE_FILTROS: string = 'Selecciona por favor un criterio de búsqueda.';
  mostrarModalFiltros: boolean = false;

  validaciones: Map<number, any> = new Map();
  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_PROMOTORES: number = 2;

  filtroForm!: FormGroup;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  niveles: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];
  promotores: TipoDropdown[] = [];
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
  filtroODSDetPago!: TipoDropdown[];
  listaFolioODS: any;
  filtroODSSiniestro: any;
  foliosODS: any;
  foliosServicioVelatorioODS: any;
  folioODSSiniestro: any;
  folioODSDetPago: any;


  anio: TipoDropdown[] = [];
  mes: TipoDropdown[] = MESES;
  exportar: TipoDropdown[] = [];
  estatusSeleccionODS!: number | null;
  nombreEndpoint = NOMBRE_ENDPOINT;

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
    this.validaciones.set(1, () => this.iniciarOrdenesServicio())
    this.validaciones.set(4, () => this.inicializarResumenDetPago())
    this.validaciones.set(5, () => this.iniciarDetalleImporteServicios())
    this.validaciones.set(6, () => this.iniciarComisionesPromotores())
    this.validaciones.set(7, () => this.iniciarServiciosVelatorios())
    this.validaciones.set(8, () => this.iniciarConcentradoSiniestrosPF())
    this.validaciones.set(9, () => this.iniciarConcentradoServicioPA())
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
      folioOds: [{value: null, disabled: false}],
      numeroOdsSiniestros: [{value: null, disabled: false}],
      folioOdsDetallePago: [{value: null, disabled: false}],
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
    this.promotores = mapearArregloTipoDropdown(respuesta[this.POSICION_PROMOTORES].datos, 'nombre', 'idPromotor');
    for (let i = 2000; i <= +moment().format('yyyy'); i++) {
      this.anio.push({label: i.toString(), value: i})
    }
    this.cambiarDelegacion(true);
  }

  seleccionarValidaciones(): void {
    const tipoSolicitud: number = this.filtroForm.get('reporte')?.value as number;
    if (!this.validaciones.has(tipoSolicitud)) return;
    this.validaciones.get(tipoSolicitud)();
  }

  cambiarDelegacion(configuracionInicial: boolean = false): void {
    if (!configuracionInicial) this.filtroForm.get('velatorio')?.patchValue(null);
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
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  estatusODS(estatusODS: number, valorODS: boolean): void {
    let listadoEstatus = ['preorden', 'generada', 'cancelada', 'pagada', 'enTransito', 'concluida', 'todos'];
    if (estatusODS != 1) this.ff.preorden.reset()
    if (estatusODS != 2) this.ff.generada.reset()
    if (estatusODS != 0) this.ff.cancelada.reset()
    if (estatusODS != 4) this.ff.pagada.reset()
    if (estatusODS != 3) this.ff.enTransito.reset()
    if (estatusODS != 6) this.ff.concluida.reset()
    if (estatusODS != 7) this.ff.todos.reset()
    this.estatusSeleccionODS = estatusODS;
    this.ff.idEstatusODS.setValue(valorODS ? estatusODS : null)
  }

  limpiarFiltros(): void {
    // this.cambiarReporte();
    this.cambiarDelegacion(true);
    this.ff.idEstatusODS.clearValidators();

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
    if (this.ff.fechaIni.value > this.ff.fechaFin.value) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    this.loaderService.activar();
    const filtros = this.consultarFiltros(this.ff.reporte.value);
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: NOMBRE_REPORTES[this.ff.reporte.value - 1]};
    const tipoReporte = this.nombreEndpoint.get(this.ff.reporte.value);
    if (filtros.tipoReporte.includes("xls")) configuracionArchivo.ext = "xlsx";
    if (filtros.tipoReporte.includes("csv")) configuracionArchivo.ext = "csv";
    this.reporteOrdenServicioService.generarReporte(filtros, tipoReporte).pipe(
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
        ).subscribe({
          next: (repuesta): void => {
            //TODO verificar si se necesita agregar mensaje de confirmación
          },
          error: (error): void => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64));
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
          idEstatusODS: this.estatusSeleccionODS == 7 ? null : this.estatusSeleccionODS,
          fechaIni: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('YYYY-MM-DD') : null,
          fechaFin: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('YYYY-MM-DD') : null,
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls',
        }
        break;
      case 2:
      return {
        idVelatorio: this.ff.velatorio.value,
        fechaInicio: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('YYYY-MM-DD') : null,
        fechaFin: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('YYYY-MM-DD') : null,
        tipoReporte:this.ff.exportar.value == 1 ? 'pdf' : 'xls'
      }
        break;
      case 3:
        return {
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('DD/MM/YYYY') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('DD/MM/YYYY') : null,
          tipoReporte: this.regresarTipoReporte(this.ff.exportar.value)
        }
        break;
      case 4:
        return {
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          id_ods: this.ff.folioOdsDetallePago.value?.value ?? null,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('DD/MM/YYYY') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('DD/MM/YYYY') : null,
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls'
        }
        break;
      case 5:
        return {
          id_velatorio: this.ff.velatorio.value,
          id_delegacion: this.ff.delegacion.value,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('YYYY-MM-DD') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('YYYY-MM-DD') : null,
          tipoReporte: this.regresarTipoReporte(this.ff.exportar.value)
        }
        //CSV
        break;
      case 6:
        return {
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          ods: this.ff.numeroOds.value?.value ?? null,
          idPromotor: this.ff.promotor.value,
          mes: this.ff.mes.value,
          anio: this.ff.anio.value,
          nombreVelatorio: this.velatorioDD.selectedOption.label,
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls'
        }
        break;
      case 7:
        //TODO revisar petición no se está mandando y agrega CSV
        return {
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          id_ods: this.ff.folioOds.value?.value ?? null,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('DD/MM/YYYY') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('DD/MM/YYYY') : null,
          tipoReporte: this.regresarTipoReporte(this.ff.exportar.value)
        }
        break;
      case 8:
        return {
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls',
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          des_velatorio: this.velatorioDD.selectedOption.label,
          ods: this.ff.numeroOdsSiniestros.value?.value ?? null,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('YYYY-MM-DD') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('YYYY-MM-DD') : null,
        }
        break;
      case 9:
        return {
          id_delegacion: this.ff.delegacion.value,
          id_velatorio: this.ff.velatorio.value,
          fecha_inicial: this.ff.fechaIni.value ? moment(this.ff.fechaIni.value).format('DD/MM/YYYY') : null,
          fecha_final: this.ff.fechaFin.value ? moment(this.ff.fechaFin.value).format('DD/MM/YYYY') : null,
          nombreVelatorio: this.velatorioDD.selectedOption.label,
          tipoReporte: this.ff.exportar.value == 1 ? 'pdf' : 'xls'
        }
        break;
      default:
        break;

    }
  }

  regresarTipoReporte(tipo: number): string {
    const tipoReporte = ["pdf","xls","csv"]
    return tipoReporte[tipo -1]
  }

  filtrarODS(): void {
    let query = this.obtenerNombreContratantesDescripcion();
    let filtered: any[] = [];
    if (query?.length < 3) return;
    for (let registro of this.foliosODS as any[]) {
      if (registro.folio?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({label: registro.folio, value: registro.folio});
      }
    }
    this.filtroODS = filtered;
  }

  filtrarFolioODS(): void {
    let query = this.obtenerFolioODS();
    let filtered: any[] = [];
    if (query?.length < 3) return;
    for (let registro of this.foliosServicioVelatorioODS as any[]) {
      if (registro.folio_ods?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({label: registro.folio_ods, value: registro.id_ods});
      }
    }
    this.listaFolioODS = filtered;
  }

  filtrarODSDetPago(): void {
    let query = this.obtenerFolioODSDetPago();
    let filtered: any[] = [];
    if (query?.length < 3) return;
    for (let registro of this.folioODSDetPago as any[]) {
      if (registro.folio_ods?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({label: registro.folio_ods, value: registro.id_ods});
      }
    }
    this.filtroODSDetPago = filtered;
  }

  filtrarODSSiniestro(): void {
    let query = this.obtenerFolioODSSiniestro();
    let filtered: any[] = [];
    if (query?.length < 3) return;
    for (let registro of this.folioODSSiniestro as any[]) {
      if (registro.folioOrdenServicio?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({label: registro.folioOrdenServicio, value: registro.folioOrdenServicio});
      }
    }
    this.filtroODSSiniestro = filtered;
  }

  obtenerNombreContratantesDescripcion(): string {
    let query = this.ff.numeroOds?.value || '';
    if (typeof this.ff.numeroOds?.value === 'object') {
      query = this.ff.numeroOds?.value?.label;
    }
    return query?.toLowerCase();
  }

  obtenerFolioODS(): string {
    let query = this.ff.folioOds?.value || '';
    if (typeof this.ff.folioOds?.value === 'object') {
      query = this.ff.folioOds?.value?.label;
    }
    return query?.toLowerCase();
  }

  obtenerFolioODSDetPago(): string {
    let query = this.ff.folioOdsDetallePago?.value || '';
    if (typeof this.ff.folioOdsDetallePago?.value === 'object') {
      query = this.ff.folioOdsDetallePago?.value?.label;
    }
    return query?.toLowerCase();
  }

  obtenerFolioODSSiniestro(): string {
    let query = this.ff.numeroOdsSiniestros?.value || '';
    if (typeof this.ff.numeroOdsSiniestros?.value === 'object') {
      query = this.ff.numeroOdsSiniestros?.value?.label;
    }
    return query?.toLowerCase();
  }

  cambiarReporte(): void {
    this.ff.idEstatusODS.clearValidators();
    this.ff.idEstatusODS.clearValidators();
    this.ff.fechaIni.clearValidators();
    this.ff.fechaFin.clearValidators();
    this.ff.mes.clearValidators();
    this.ff.anio.clearValidators();

    this.ff.idEstatusODS.updateValueAndValidity();
    this.ff.idEstatusODS.updateValueAndValidity();
    this.ff.fechaIni.updateValueAndValidity();
    this.ff.fechaFin.updateValueAndValidity();
    this.ff.mes.updateValueAndValidity();
    this.ff.anio.updateValueAndValidity();

    this.seleccionarValidaciones();
    this.exportar = this.limpiarTiposExportacion();
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
    this.ff.idEstatusODS.setValidators(Validators.required);
    this.ff.idEstatusODS.updateValueAndValidity();
  }

  validacionesGenerales(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  iniciarOrdenesServicio(): void {
    this.ff.idEstatusODS.setValidators(Validators.required);
    this.ff.idEstatusODS.updateValueAndValidity();
  }

  inicializarResumenDetPago(): void {
    this.loaderService.activar()
    this.reporteOrdenServicioService.consultarFolioODSDetallePago(this.ff.delegacion.value, this.ff.velatorio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.folioODSDetPago = respuesta.datos;
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
  }

  iniciarDetalleImporteServicios(): void {
    this.ff.fechaIni.setValidators(Validators.required);
    this.ff.fechaIni.updateValueAndValidity();
    this.ff.fechaFin.setValidators(Validators.required);
    this.ff.fechaFin.updateValueAndValidity();
  }

  iniciarComisionesPromotores(): void {
    this.loaderService.activar();
    this.reporteOrdenServicioService.consultarODSComisionPromotor(this.ff.delegacion.value, this.ff.velatorio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.foliosODS = respuesta.datos || [];
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  iniciarServiciosVelatorios(): void {
    this.ff.mes.setValue(Validators.required);
    this.ff.anio.setValue(Validators.required);
    this.ff.mes.updateValueAndValidity();
    this.ff.anio.updateValueAndValidity();

    this.loaderService.activar();
    this.reporteOrdenServicioService.consultarODSServiciosVelatorios(this.ff.delegacion.value, this.ff.velatorio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.foliosServicioVelatorioODS = respuesta.datos || [];
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  iniciarConcentradoSiniestrosPF(): void {
    this.ff.fechaIni.setValidators(Validators.required);
    this.ff.fechaIni.updateValueAndValidity();
    this.ff.fechaFin.setValidators(Validators.required);
    this.ff.fechaFin.updateValueAndValidity();
    this.reporteOrdenServicioService.consultaODSPF(this.ff.delegacion.value, this.ff.velatorio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.folioODSSiniestro = respuesta.datos || [];
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  iniciarConcentradoServicioPA(): void {
    console.log('Se agrega console por SONAR')
  }

  get idReporte(): number {
    return this.filtroForm.get('reporte')?.value
  }

  get ff() {
    return this.filtroForm.controls;
  }

  consultarValidaciones(): boolean {
    return this.filtroForm.invalid
    console.log(this.filtroForm);
  }

  limpiarTiposExportacion(): TipoDropdown[] {
    const ARCHIVO: TipoDropdown[] = [...TIPO_ARCHIVO];
    if ([3,5,7].includes(this.idReporte)) return ARCHIVO;
    ARCHIVO.pop();
    return ARCHIVO;
  }
}
