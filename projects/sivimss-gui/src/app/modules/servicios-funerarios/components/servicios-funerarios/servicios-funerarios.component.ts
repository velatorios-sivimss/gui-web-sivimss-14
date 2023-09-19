import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {
  ConsultaPaginado,
  GenerarReporte,
} from "../../models/servicios-funerarios.interface"
import {LazyLoadEvent} from "primeng/api";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {ServiciosFunerariosConsultaService} from "../../services/servicios-funerarios-consulta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {PaginadoInterface} from "../../models/paginado.interface";
import * as moment from 'moment';
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {of} from "rxjs";


@Component({
  selector: 'app-servicios-funerarios',
  templateUrl: './servicios-funerarios.component.html',
  styleUrls: ['./servicios-funerarios.component.scss'],
  providers: [DescargaArchivosService]
})
export class ServiciosFunerariosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_ESTATUS: number = 2;

  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  filtroForm!: FormGroup;

  fechaActual = new Date();

  nivel:TipoDropdown[] = [];
  delegacion:TipoDropdown[] = [];
  estatus:TipoDropdown[] = [];
  velatorio:TipoDropdown[] = [];

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  servicioFunerario:ConsultaPaginado[] = [];
  servicioSeleccionado!: ConsultaPaginado;
  mostrarModalConfirmacion: boolean = false;
  mensajeArchivoConfirmacion: string = "";
  mostrarModalCancelarPlan: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private descargaArchivosService: DescargaArchivosService,
    private formBuilder: FormBuilder,
    private router: Router,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosConsultaService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarCatalogos();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
              nivel: [{value: +this.rolLocalStorage.idOficina, disabled:true}],
         delegacion: [{value: +this.rolLocalStorage.idDelegacion || null, disabled:+this.rolLocalStorage.idOficina >= 2 }],
          velatorio: [{value: null, disabled:+this.rolLocalStorage.idOficina === 3 }],
      folioPlanSFPA: [{value: null, disabled:false}],
                rfc: [{value: null, disabled:false}],
               curp: [{value: null, disabled:false}],
            estatus: [{value: null, disabled:false}],
           afiliado: [{value: null, disabled:false}],
        rangoInicio: [{value: null, disabled:false}],
           rangoFin: [{value: null, disabled:false}]
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.nivel = respuesta[this.POSICION_NIVELES];
    this.delegacion = respuesta[this.POSICION_DELEGACIONES];
    this.estatus = respuesta[this.POSICION_ESTATUS];
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.paginar();
  }

  paginar(event?: LazyLoadEvent): void {

    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1))
    } else{
      this.numPaginaActual = 0;
    }
    this.paginarPorFiltros()
  }

  buscar(): void {
    if(this.ff.velatorio.value == null &&
      (this.ff.folioPlanSFPA.value == null || this.ff.folioPlanSFPA.value == "") &&
      (this.ff.rfc.value == null || this.ff.rfc.value == "")  &&
      (this.ff.curp.value == null || this.ff.curp.value == "") &&
      this.ff.estatus.value == null &&
      (this.ff.afiliado.value == null || this.ff.afiliado.value == "") &&
      (this.ff.rangoInicio.value == null || this.ff.rangoInicio.value == "") &&
      (this.ff.rangoFin.value == null || this.ff.rangoFin.value == "")
    ){
      this.alertaService.mostrar(TipoAlerta.Precaucion,this.mensajesSistemaService.obtenerMensajeSistemaPorId(22
        || 'El servicio no responde, no permite más llamadas.'));
      return
    }
    this.paginar();
  }

  paginarPorFiltros(): void {
    this.servicioFunerario = [];
    const filtros = this.obtenerObjetoParaFiltrado();
    this.loaderService.activar()
    this.serviciosFunerariosService.paginar(this.numPaginaActual,this.cantElementosPorPagina,filtros).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.servicioFunerario = respuesta.datos.content || [];
        this.totalElementos = respuesta.datos.totalElements || 0;
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    });
  }

  obtenerObjetoParaFiltrado(): PaginadoInterface {
    return {
            idVelatorio: this.ff.velatorio.value ?? null,
       numFolioPlanSfpa: this.ff.folioPlanSFPA.value ?? null,
                    rfc: this.ff.rfc.value ?? null,
                   curp: this.ff.curp.value ?? null,
         nombreAfiliado: this.ff.afiliado.value ?? null,
      idEstatusPlanSfpa: this.ff.estatus.value ?? null,
            fechaInicio: this.ff.rangoInicio.value ?
              moment(this.ff.rangoInicio.value).format('YYYY-MM-DD') : null,
               fechaFin: this.ff.rangoFin.value ?
                 moment(this.ff.rangoFin.value).format('YYYY-MM-DD') : null,
    }
  }

  obtenerObjetoParaReporte(tipoReporte: string): GenerarReporte {
    return {
            idVelatorio: this.ff.velatorio.value ?? null,
       numFolioPlanSfpa: this.ff.folioPlanSFPA.value ?? null,
                    rfc: this.ff.rfc.value ?? null,
                   curp: this.ff.curp.value ?? null,
         nombreAfiliado: this.ff.afiliado.value ?? null,
      idEstatusPlanSfpa: this.ff.estatus.value ?? null,
            fechaInicio: this.ff.rangoInicio.value ?
                         moment(this.ff.rangoInicio.value).format('YYYY-MM-DD') : null,
               fechaFin: this.ff.rangoFin.value ?
                         moment(this.ff.rangoFin.value).format('YYYY-MM-DD') : null,
            tipoReporte: tipoReporte
    }
  }


  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroForm.get('rangoInicio')?.value;
    const fechaFinal = this.filtroForm.get('rangoFin')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (fechaInicial <= fechaFinal) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(20));
    this.filtroForm.get('rangoInicio')?.patchValue(null);
    this.filtroForm.get('rangoFin')?.patchValue(null);
  }

  consultarVelatorios(): void {
    this.loaderService.activar();
    this.serviciosFunerariosService.obtenerCatalogoVelatoriosPorDelegacion(this.ff.delegacion.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        this.velatorio = mapearArregloTipoDropdown(respuesta.datos,"nomVelatorio","idVelatorio");
      },
      error:(error:HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  exportarArchivo(extension: string): void {
    this.loaderService.activar()
    let filtros = this.obtenerObjetoParaReporte(extension);
    const configuracionArchivo: OpcionesArchivos = {};
    if(extension.includes("xls")){
      configuracionArchivo.ext = "xlsx"
    }
    filtros.tipoReporte = extension;
    this.serviciosFunerariosService.generarArchivoPaginador(filtros).pipe(
      finalize(()=> this.loaderService.desactivar())).subscribe(
      {
        next: (respuesta: HttpRespuesta<any>) => {
          const file = new Blob([this.descargaArchivosService.base64_2Blob(
                      respuesta.datos,this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
                      { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
          this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
            finalize(() => this.loaderService.desactivar())).subscribe(
            (repuesta) => {
              this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
              this.mostrarModalConfirmacion = true;
            },
            (error) => {
              this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
            }
          )
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
        }
      }
    );

  }

  verContrato(): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    this.serviciosFunerariosService.consultarContrato(this.servicioSeleccionado.ID_PLAN_SFPA).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {

        const file = new Blob([this.descargaArchivosService.base64_2Blob(
            respuesta.datos,this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });

        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())).subscribe(
          (repuesta) => {
            this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
            this.mostrarModalConfirmacion = true;
          },
          (error) => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        )
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
      }
    });
  }

  abrirPanel(event: MouseEvent, servicioFunerario: ConsultaPaginado): void {
    this.servicioSeleccionado = servicioFunerario;
    this.overlayPanel.toggle(event);
  }


  detallePago(): void {
    this.router.navigate(["servicios-funerarios/detalle-pago"],{
      queryParams:{idPlanSfpa:this.servicioSeleccionado.ID_PLAN_SFPA}})
  }

  cancelarPago(): void {
    this.loaderService.activar();
    this.serviciosFunerariosService.cancelarPlanSfpa(this.servicioSeleccionado.ID_PLAN_SFPA).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        this.mostrarModalCancelarPlan = false;
        this.paginar();
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }



  modificarPago(): void {
    this.router.navigate(["servicios-funerarios/modificar-pago"],{
      queryParams:{idPlanSfpa:this.servicioSeleccionado.ID_PLAN_SFPA}})
  }

  get ff(){
    return this.filtroForm.controls;
  }

}
