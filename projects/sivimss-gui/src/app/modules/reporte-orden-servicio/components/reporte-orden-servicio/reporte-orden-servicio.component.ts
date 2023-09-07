import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {ReporteOrdenServicioService} from "../../services/reporte-orden-servicio.service";
import {SERVICIO_BREADCRUMB_CLEAR} from "../../../servicios-funerarios/constants/breadcrumb";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";

@Component({
  selector: 'app-reporte-orden-servicio',
  templateUrl: './reporte-orden-servicio.component.html',
  styleUrls: ['./reporte-orden-servicio.component.scss'],
  providers: [DescargaArchivosService]
})
export class ReporteOrdenServicioComponent implements OnInit {

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
  reportes: TipoDropdown[] =[
    {value:1, label:'	Reporte de órdenes de servicio'},
    {value:2, label:'	Concentrado de Facturas'},
    {value:3, label:'	Reporte resumen pago proveedor'},
    {value:4, label:'	Reporte detalle pago'},
    {value:5, label:'	Reporte detalle importe-servicios'},
    {value:6, label:'	Reporte de Comisiones de Promotores'},
    {value:7, label:'	Reporte de servicios velatorio'},
    {value:8, label:'	Concentrado de Siniestros de Previsión Funeraria'},
    {value:9, label:'	Concentrado de Servicios Pago Anticipado'}
    ];

  filtroODS!: TipoDropdown[];
  listaODS: any;

  promotor!: TipoDropdown[];

  anio!: TipoDropdown[];
  mes!: TipoDropdown[];
  tipoODSBandera: boolean = false;
  numeroODSBandera: boolean = false;
  promotorBandera: boolean = false;
  anioBandera: boolean = false;
  mesBandera: boolean = false;
  fechaInicialBandera: boolean = false;
  fechaFinalBandera: boolean = false;
  banderaEstatusODS: boolean = false;


  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public  dialogService: DialogService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private reporteOrdenServicioService:ReporteOrdenServicioService,
    private descargaArchivosService: DescargaArchivosService,
  ) { }

  fechaActual = new Date();
  mostrarModalFechaMayor: boolean = false;
  fechaRango = moment().subtract(10, 'years').toDate();

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarForm();
    if(this.ff.delegacion.value)this.cambiarDelegacion();
    this.inicializarCatalogos();
  }

  inicializarForm(): void {
    this.filtroForm = this.formBuilder.group({
      tipoReporte:[{value:null,disabled:false}],
      reporte:[{value:null,disabled:false}],
      nivel: [{value: +this.rolLocalStorage.idOficina, disabled:true}],
      delegacion: [{value: +this.rolLocalStorage.idDelegacion || null, disabled:+this.rolLocalStorage.idOficina >= 2 }],
      velatorio: [{value: null, disabled:+this.rolLocalStorage.idOficina === 3 }],
      idTipoODS: [{value:null,disabled:false}],
      idEstatusODS: [{value:null,disabled:false}],
      fechaIni: [{value:null,disabled:false}],
      fechaFin: [{value:null,disabled:false}],
      numeroOds: [{value:null,disabled:false}],
      promotor: [{value:null,disabled:false}],
      anio: [{value:null,disabled:false}],
      mes: [{value:null,disabled:false}],

      preorden: [{value:null,disabled:false}],
      generada: [{value:null,disabled:false}],
      cancelada: [{value:null,disabled:false}],
      pagada: [{value:null,disabled:false}],
      enTransito: [{value:null,disabled:false}],
      concluida: [{value:null,disabled:false}],
      todos: [{value:null,disabled:false}],
    })
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.niveles = respuesta[this.POSICION_NIVELES];
    this.delegaciones = respuesta[this.POSICION_DELEGACIONES];
  }

  validarFechaFinal(): void {
    if (!this.ff.fechaIni?.value || !this.ff.fechaFin?.value) {
      return
    }
    if (this.ff.fechaIni.value > this.ff.fechaFin.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.reporteOrdenServicioService.obtenerCatalogoVelatoriosPorDelegacion(this.ff.delegacion.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        this.velatorios = mapearArregloTipoDropdown(respuesta.datos,"nomVelatorio","idVelatorio");
      },
      error:(error:HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  estatusODS(estatusODS?: number):void {

  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
  }

  exportarReporte(): void {

  }

  filtrarODS(): void {
    let query = this.obtenerNombreContratantesDescripcion();
    let filtered: any[] = [];
    if(query?.length < 3)return;
    for (let i = 0; i < (this.listaODS as any[]).length; i++) {
      let ods = (this.listaODS as any[])[i];
      if (ods.folioODS?.toLowerCase().indexOf(query.toLowerCase()) == 0) {

        filtered.push({label: "",value: ""});
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
    this.tipoODSBandera = false;
    this.numeroODSBandera = false;
    this.promotorBandera = false;
    this.anioBandera = false;
    this.mesBandera = false;
    this.fechaInicialBandera = false;
    this.fechaFinalBandera = false;
    this.banderaEstatusODS = false;


    switch (this.ff.reporte.value) {
      case 1:
        this.tipoODSBandera = true;
        this.banderaEstatusODS = true;
        this.fechaInicialBandera = true;
        this.fechaFinalBandera = true;
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
        this.promotorBandera = false;
        this.anioBandera = false;
        this.mesBandera = false;
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

  get ff(){
    return this.filtroForm.controls;
  }

}
