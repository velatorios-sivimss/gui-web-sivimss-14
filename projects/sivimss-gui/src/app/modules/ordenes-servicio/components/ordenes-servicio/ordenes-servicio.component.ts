import {Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LazyLoadEvent } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import {
  ModalGenerarTarjetaIdentificacionComponent
} from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component";
import { ModalVerTarjetaIdentificacionComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-tarjeta-identificacion/modal-ver-tarjeta-identificacion.component";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "projects/sivimss-gui/src/app/utils/constantes";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ConsultarOrdenServicioService} from "../../services/consultar-orden-servicio.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {VelatorioInterface} from "../../../reservar-salas/models/velatorio.interface";
import {
  catalogoFolioODS,
  catalogoVelatorio,
  catalogoUnidadesMedicas,
  catalogoTipoODS, catalogoContratantes, catalogoFinado
} from "../../constants/catalogos.interface";
import {OrdenServicioFiltroConsulta, OrdenServicioPaginado} from "../../models/orden-servicio-paginado.interface";
import {CancelarOrdenServicioComponent} from "../cancelar-orden-servicio/cancelar-orden-servicio.component";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {of} from "rxjs";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";

@Component({
  selector: 'app-ordenes-servicio',
  templateUrl: './ordenes-servicio.component.html',
  styleUrls: ['./ordenes-servicio.component.scss'],
  providers: [DescargaArchivosService]
})
export class OrdenesServicioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACION: number = 0;
  readonly POSICION_TIPO_ODS: number = 1;
  readonly POSICION_ESTATUS_ODS: number = 2;
  readonly POSICION_CONTRATANTES: number = 3;
  readonly POSICION_FINADOS: number = 4;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;



  delegaciones!: TipoDropdown[];
  velatorios!: TipoDropdown[];
  folios!: TipoDropdown[];
  foliosDescripcion!: catalogoFolioODS[];
  nombreContratantes!: TipoDropdown[];
  nombreFinados!: TipoDropdown[];
  unidadesMedicas!: TipoDropdown[];
  tipoODS!: TipoDropdown[];
  estatusODS!: TipoDropdown[];

  nombresContratantes!: catalogoContratantes;
  nombresFinados!: catalogoFinado;

  filtroForm!: FormGroup;
  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;

  mostrarDescargaEntradas: boolean = false;
  mostrarDescagaSalidas: boolean = false;


  ordenesServicio: OrdenServicioPaginado[] = [];
  ordenServicioSeleccionada!: any;

  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private formBuilder: FormBuilder,
    private consultarOrdenServicioService: ConsultarOrdenServicioService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private breadcrumbService: BreadcrumbService,
    private loaderService: LoaderService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
    private renderer: Renderer2,

    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);

    let respuesta = this.route.snapshot.data['respuesta'];
    this.delegaciones = respuesta[this.POSICION_DELEGACION];
    this.unidadesMedicas = respuesta[1];




    this.consultarTipoODS();
    this.consultarEstatusODS();
    this.consultarNombreContratantes();
    this.consultarNombreFinados();
    this.inicializarFiltroForm();
  }
  consultarTipoODS(): void{
    this.loaderService.activar()
    this.consultarOrdenServicioService.consultaTipoODS().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.tipoODS = mapearArregloTipoDropdown(respuesta.datos, 'tipoODS', 'idTipoODS') || [];
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }
  consultarEstatusODS(): void{
    this.loaderService.activar()
    this.consultarOrdenServicioService.obtenerCatalogoEstatus().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
    this.estatusODS = mapearArregloTipoDropdown(respuesta.datos, 'estatus', 'idODS') || [];

      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }
  consultarNombreContratantes(): void{
    this.loaderService.activar()
    this.consultarOrdenServicioService.nombreContratante().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
          this.nombresContratantes = respuesta.datos || [];
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }
  consultarNombreFinados(): void{
    this.loaderService.activar()
    this.consultarOrdenServicioService.nombreFinado().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.nombresFinados = respuesta.datos || [];

      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
             delegacion: [{value: +this.rolLocalStorage.idDelegacion || null, disabled:  +this.rolLocalStorage.idOficina >= 2}],
              velatorio: [{value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3}],
            numeroFolio: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
           nombreFinado: [{value: null, disabled: false}],
              tipoOrden: [{value: null, disabled: false}],
      unidadProcedencia: [{value: null, disabled: false}, [Validators.required]],
         numeroContrato: [{value: null, disabled: false}],
                estatus: [{value: null, disabled: false}]
    });
    this.consultarVelatorioPorID()
  }

  paginar(event?: LazyLoadEvent): void {
    if (event && event.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    } else{
      this.numPaginaActual = 0;
    }
    this.paginarPorFiltros()
  }

  paginarPorFiltros(): void {
    this.totalElementos = 0;
    this.ordenesServicio = [];
    const filtros = this.obtenerObjetoParaFiltrado();
    delete filtros.tipoReporte
    this.loaderService.activar();
    this.consultarOrdenServicioService.consultarODS(filtros,this.numPaginaActual,this.cantElementosPorPagina).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.ordenesServicio = respuesta.datos.content || [];
        this.totalElementos = respuesta.datos.totalElements || 0;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )
  }

  obtenerObjetoParaFiltrado(): OrdenServicioFiltroConsulta{
    return {
      // numeroFolio: this.formulario.numeroFolio.value ?? null,
      cveFolio: this.formulario.numeroFolio.value ?? null,
      idVelatorio: this.formulario.velatorio.value ?? null,
      idTipoODS: this.formulario.tipoOrden.value ?? null,
      idUnidadMedica: this.formulario.unidadProcedencia.value ?? null,
      cveConvenio: this.formulario.numeroContrato.value ?? null,
      idEstatusODS: this.formulario.estatus.value ?? null,
      tipoReporte: "pdf",
      nombreFinado: this.formulario.nombreFinado.value?.value.nomFinado ?? null,
      // apPatFinado: this.formulario.nombreFinado.value?.value.apPatContratante ?? null,
      // apMatFinado: this.formulario.nombreFinado.value?.value.apMatContratante ?? null,
      nombreContratante: this.formulario.nombreContratante.value?.value.nomContratante ?? null,
      // apPatContratante: this.formulario.nombreContratante.value?.value.apPatContratante ?? null,
      // apMatContratante: this.formulario.nombreContratante.value?.value.apMatContratante ?? null,
    }
  }

  buscar() {
    this.loaderService.activar();
    setTimeout(() => {
      this.loaderService.desactivar();
    }, 2000);
  }

  abrirPanel(event: MouseEvent, ordenServicioSeleccionada: any): void {
    this.ordenServicioSeleccionada = ordenServicioSeleccionada;
    this.ordenServicioSeleccionada.EntradaDonacion > 0 ? this.mostrarDescargaEntradas = true : this.mostrarDescargaEntradas = false
    this.ordenServicioSeleccionada.SalidaDonacion   > 0 ? this.mostrarDescagaSalidas = true : this.mostrarDescagaSalidas = false
    this.overlayPanel.toggle(event);
  }

  abrirModalGenerarTarjetaIdent() {
    const ref = this.dialogService.open(ModalGenerarTarjetaIdentificacionComponent, {
      header: 'Generar tarjeta de identificación',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        ods: this.ordenServicioSeleccionada
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.paginar();
      }
    });
  }

  abrirModalVerTarjetaIdent() {
    const ref = this.dialogService.open(ModalVerTarjetaIdentificacionComponent, {
      header: 'Ver tarjeta de identificación',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalVerTarjetaIdentificacionComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalVerTarjetaIdentificacionComponent
      }
    });
  }

  abrirModalCancelarODS(): void {
    if( this.ordenServicioSeleccionada.estatus?.includes('Generada') &&
        this.ordenServicioSeleccionada.tiempoGeneracionODSHrs < 24){
        const ref = this.dialogService.open(CancelarOrdenServicioComponent, {
          header: 'Cancelar ODS',
          style: {maxWidth: '876px', width: '100%'},
          data: {
            ods: this.ordenServicioSeleccionada
          }
        });
        ref.onClose.subscribe((val: boolean | string) => {
          if (val) {
            this.loaderService.activar();
            this.consultarOrdenServicioService.cancelarODS(val).pipe(
              finalize(()=>this.loaderService.desactivar())
            ).subscribe(
              (respuesta: HttpRespuesta<any>): void => {
                this.paginar();
                this.alertaService.mostrar(TipoAlerta.Exito,this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje)));
              },
              (error:HttpErrorResponse) => {
                const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
                this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error al guardar la información. Intenta nuevamente.');
              }
            )
          }
        });
    }else{
      this.alertaService.mostrar(TipoAlerta.Info,this.mensajesSistemaService.obtenerMensajeSistemaPorId(210));
      return
    }



  }

  consultarVelatorioPorID(): void {
    this.loaderService.activar();
    this.consultarOrdenServicioService.consultarVelatorios(+this.formulario.delegacion.value).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        // this.consultarUnidadMedica();
        this.velatorios = respuesta.datos.map((velatorio: catalogoVelatorio) => (
          { label: velatorio.DES_VELATORIO, value: velatorio.idVelatorio })) || [];
      },
      (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )
  }


  consultarFoliosODS(): void {
    this.loaderService.activar();
    this.consultarOrdenServicioService.consultarFolioODS(+this.formulario.velatorio.value).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.foliosDescripcion = respuesta.datos || [];
        this.folios = respuesta.datos.map((folio: catalogoFolioODS) => (
          { label: folio.folioODS, value: folio.idODS })) || [];
      },
      (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )
  }

  filtrarContratantes(): void {
    let query = this.obtenerNombreContratantesDescripcion("contratante");
    let filtered: any[] = [];
    if(query?.length < 3)return;
    for (let i = 0; i < (this.nombresContratantes as any[]).length; i++) {
      let contratante = (this.nombresContratantes as any[])[i];
      if (contratante.nombreCompletoContratante?.toLowerCase().indexOf(query.toLowerCase()) == 0) {

        filtered.push({
            label: contratante.nombreCompletoContratante,
            value:
              {
                nomContratante: contratante.nombreCompletoContratante,
                // apPatContratante: contratante.apPatContratante,
                // apMatContratante: contratante.apMatContratante
              }
          })
      }
    }
    this.nombreContratantes = filtered;
  }

  filtrarFinados(): void {
    let query = this.obtenerNombreContratantesDescripcion("finado");
    let filtered: TipoDropdown[] = [];
    if(query?.length < 3)return;
    for (let i = 0; i < (this.nombresFinados as catalogoFinado[]).length; i++) {
      let finado = (this.nombresFinados as any[])[i];
      if (finado.nombreCompletoFinado.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push({
          label: finado.nombreCompletoFinado,
          value: {
            nomFinado: finado.nombreCompletoFinado,
            // apPatContratante: finado.apPatContratante,
            // apMatContratante: finado.apMatContratante
          }
        })
      }
    }
    this.nombreFinados = filtered;
  }



  obtenerNombreContratantesDescripcion(referencia: string): string {
    if(referencia.includes('contratante')){
      let query = this.formulario.nombreContratante?.value || '';
      if (typeof this.formulario.nombreContratante?.value === 'object') {
        query = this.formulario.nombreContratante?.value?.label;
      }
      return query?.toLowerCase();
    }
    let query = this.formulario.nombreFinado?.value || '';
    if (typeof this.formulario.nombreFinado?.value === 'object') {
      query = this.formulario.nombreFinado?.value?.label;
    }
    return query?.toLowerCase();
  }

  consultarUnidadMedica(): void {
    // this.loaderService.activar();
    // this.consultarOrdenServicioService.unidadMedica(this.formulario.delegacion.value).pipe(
    //   finalize(()=>this.loaderService.desactivar())
    // ).subscribe(
    //   (respuesta: HttpRespuesta<any>): void => {
    //     this.unidadesMedicas = respuesta.datos.map((unidadMedica: catalogoUnidadesMedicas) => (
    //       { label: unidadMedica.nombreUnidad, value: unidadMedica.idUnidadMedica })) || [];
    //   },
    //   (error:HttpErrorResponse) => {
    //     const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
    //     this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
    //   }
    // )



  }

  exportarArchivo(extension: string): void {

    // if(this.filtroForm.invalid)return;
    this.loaderService.activar()
    let filtros = this.obtenerObjetoParaFiltrado();
    const configuracionArchivo: OpcionesArchivos = {};
    if(extension.includes("xls")){
      configuracionArchivo.ext = "xlsx"
    }
    filtros.tipoReporte = extension;
    this.consultarOrdenServicioService.generarArchivoPaginador(filtros).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())
        ).subscribe(
          (repuesta) => {
            this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
            this.mostrarModalConfirmacion = true;
          },
          (error) => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        )
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    )
  }

  descargarContratoServInmediatos(): void{
    this.loaderService.activar()
    let tipoReporte = 0;
    if(this.ordenServicioSeleccionada.estatus?.includes('Generada')){
      tipoReporte = 1;
    }
    if(this.ordenServicioSeleccionada.estatus?.includes('Preorden')){
      tipoReporte = 0;
    }
    let filtros = this.obtenerObjetoParaFiltrado();
    const configuracionArchivo: OpcionesArchivos = {ext:'pdf'};
    this.consultarOrdenServicioService.generarArchivoServiciosInmediatos(this.ordenServicioSeleccionada.idOrdenServicio,tipoReporte).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
          const url = window.URL.createObjectURL(file);
          link.setAttribute('download','documento');
          link.setAttribute('href', url);
          link.click();
          link.remove();
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    )
  }

  descargarOrdenServicio(): void {
    this.loaderService.activar()
    let filtros = this.obtenerObjetoParaFiltrado();
    const configuracionArchivo: OpcionesArchivos = {ext:'pdf'};
    let estatusODS:number = 1;
    this.ordenServicioSeleccionada.estatus?.includes("Generada") ? estatusODS = 2 : estatusODS= 1;
    this.consultarOrdenServicioService.generarArchivoOrdenServicio(
      this.ordenServicioSeleccionada.idOrdenServicio,estatusODS
    ).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download','documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    )
  }

  modificarODS(): void {
    // let estatusODS =["Cancelado","Preorden","Generada","En transito","Pagada","Facturada","Concluida","Activa"]
    // let od = this.ordenServicioSeleccionada;
    // let estatusODS;
    // this.ordenServicioSeleccionada == 1 ? estatusODS = 1 :
    this.router.navigate(["ordenes-de-servicio/modificar-orden-de-servicio"],
      {queryParams: { idODS:this.ordenServicioSeleccionada.idOrdenServicio, idEstatus:1 }})
  }
  modificarODSsf(): void {
    this.router.navigate(["ordenes-de-servicio/modificar-ods-sf"],
      {queryParams: { idODS:this.ordenServicioSeleccionada.idOrdenServicio, idEstatus:1 }})
  }

  ordenComplementaria(): void {
    this.router.navigate(["ordenes-de-servicio/modificar-orden-de-servicio"],
      {queryParams: { idODS:this.ordenServicioSeleccionada.idOrdenServicio, idEstatus:0 }})
  }

  descargarEntradas(): void {
    let tipoConsulta = this.ordenServicioSeleccionada.estatus == "Preorden" ? 0 : 1;
    this.loaderService.activar()
    let filtros = this.obtenerObjetoParaFiltrado();
    const configuracionArchivo: OpcionesArchivos = {ext:'pdf'};
    this.consultarOrdenServicioService.generarArchivoEntradaDonaciones(
      this.ordenServicioSeleccionada.idOrdenServicio,tipoConsulta
    ).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download','documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    )
  }

  descargarSalidas(): void {
    let tipoConsulta = this.ordenServicioSeleccionada.estatus == "Preorden" ? 0 : 1;
    this.loaderService.activar()
    let filtros = this.obtenerObjetoParaFiltrado();
    const configuracionArchivo: OpcionesArchivos = {ext:'pdf'};
    this.consultarOrdenServicioService.generarArchivoSalidaDonaciones(
      this.ordenServicioSeleccionada.idOrdenServicio,tipoConsulta
    ).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download','documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    )
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.paginar();
  }

  get formulario()  {
    return this.filtroForm.controls;
  }

}
