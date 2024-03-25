import {Component, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ModalEliminarPagoComponent } from 'projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-eliminar-pago/modal-eliminar-pago.component';
import { ModalRealizarPagoComponent } from 'projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-realizar-pago/modal-realizar-pago.component';
import {
  ServiciosFunerariosInterface,
  DetallePago,
} from '../../models/servicios-funerarios.interface';
import { DIEZ_ELEMENTOS_POR_PAGINA } from '../../../../utils/constantes';
import { LazyLoadEvent } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { DetallePagoService } from '../../services/detalle-pago.service';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from '../../../../utils/funciones';
import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service';
import { MensajesSistemaService } from '../../../../services/mensajes-sistema.service';
import {
  DetalleServicios,
  PagosBitacora,
  PagosRealizados,
} from '../../models/detalle-servicios.interface';
import { ModalModificarPagosComponent } from '../modal-modificar-pagos/modal-modificar-pagos.component';
import { of } from 'rxjs';
import { OpcionesArchivos } from '../../../../models/opciones-archivos.interface';
import { DescargaArchivosService } from '../../../../services/descarga-archivos.service';
import * as moment from "moment";


@Component({
  selector: ' app-detalle-servicios-funerarios',
  templateUrl: './detalle-servicios-funerarios.component.html',
  styleUrls: ['./detalle-servicios-funerarios.component.scss'],
  providers: [DialogService, DescargaArchivosService],
})
export class DetalleServiciosFunerariosComponent implements OnInit, OnDestroy {
  @Input() servicioFunerario: ServiciosFunerariosInterface[] = [];

  @ViewChild(OverlayPanel)
  overlayPanelHeader!: OverlayPanel;

  @ViewChild(OverlayPanel)
  overlayPanelBody!: OverlayPanel;

  readonly POSICION_METODO_PAGO: number = 0;
  readonly MENSAJE_ARCHIVO_DESCARGA_EXITOSA: string = "El archivo se guardó correctamente.";

  mostrarModalDescargaExitosa: boolean = false;
  fechaActual = moment().format('YYYY-MM-DD');
  detallePago: DetallePago[] = [];
  detallePagoBitacora!: PagosBitacora;
  PagosBitacora: PagosBitacora[] = [];
  metodosPago!: TipoDropdown[];
  detalleRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  opcionRealizarPagos = true;
  noPagos: number = 0;
  precio: number = 0;

  datosGenerales!: DetalleServicios;
  pagosRealizados!: PagosRealizados[];
  item!: PagosRealizados;

  usuario = JSON.parse(localStorage.getItem('usuario') as string);
  mensajeArchivoConfirmacion: string = '';
  mostrarModalConfirmacion: boolean = false;
  totalPagos: number = 0;
  costoRestante: number = 0;
  errorMsg =
    ' Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';
  ocultarBitacora: boolean = false;
  idPagoSFPA: any;

  constructor(
    private alertaService: AlertaService,
    private detallePagoService: DetallePagoService,
    private dialogService: DialogService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.metodosPago = mapearArregloTipoDropdown(
      respuesta[this.POSICION_METODO_PAGO].datos,
      'metodoPago',
      'idMetodoPago'
    );

    this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
  }

  consultarDetallePago(idPlanSfpa: number): void {
    if (validarUsuarioLogueado()) return;
    this.detallePagoService
      .obtenerDetallePago(+idPlanSfpa)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error === false && respuesta.mensaje === 'Exito') {
            this.datosGenerales = respuesta.datos.datosGenerales;
            this.costoRestante = Number(this.datosGenerales.costoRestante);
            this.precio = Number(this.datosGenerales.precio);
            this.pagosRealizados = respuesta.datos.detallePago || [];
            this.noPagos = this.pagosRealizados.length;
          } else {
            this.alertaService.mostrar(TipoAlerta.Info, this.errorMsg);
            console.log(respuesta.mensaje);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.alertaService.mostrar(
            TipoAlerta.Info,
            this.errorMsg || 'El servicio no responde, no permite más llamadas.'
          );
        },
      });
  }

  abrirPanelBody(event: MouseEvent, detallePagoBitacora: PagosBitacora): void {
    const importeActualizado = this.pagosRealizados.filter((pago:any) => {
            return pago.idPagoSFPA == this.idPagoSFPA;
    });
    this.item.importeAcumulado = importeActualizado[0].importeAcumulado;
    this.detallePagoBitacora = detallePagoBitacora;
    this.item.folio = this.datosGenerales.folio;
    this.overlayPanelBody.toggle(event);
  }

  abrirModalRealizarPago(): void {
    if (!this.opcionRealizarPagos) return;
    const ref = this.dialogService.open(ModalRealizarPagoComponent, {
      header: 'Realizar pago',
      style: {
        maxWidth: '876px',
        width: '100%',
      },
      data: {
        metodosPago: this.metodosPago,
        detallePago: this.datosGenerales,
        item: this.item,
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
        setTimeout(()=> {
          if(this.item.idPagoSFPA)this.buscarPagosBitacora(Number(this.item.idPagoSFPA));
        },500)
      }
    });
  }

  exportarArchivo(extension: string): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    if (extension == 'xls') {
      configuracionArchivo.ext = 'xlsx';
    }
    const objetoReporte = this.generarObjetoReporte(extension);

    this.detallePagoService.reciboParcialidades(objetoReporte).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta) {
          let link = this.renderer.createElement('a');
          const file = respuesta;
          const url = window.URL.createObjectURL(file);
          const extensionArchivo =  configuracionArchivo.ext ? 'documento.xlsx' : 'documento.pdf'
          link.setAttribute('download', extensionArchivo);
          link.setAttribute('href', url);
          link.click();
          link.remove();
          this.mostrarModalDescargaExitosa = true;
        }
      },
      error: (error: HttpErrorResponse): void => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    })
  }

  generarObjetoReporte(tipoReporte: string): any {
    return {
      folio: this.datosGenerales.folio,
      nombreContratante: this.datosGenerales.nombre,
      tipoReporte: tipoReporte,
      idPlanSFPA : +this.route.snapshot.queryParams.idPlanSfpa
    };
  }

  abrirModalModificarPago(): void {
    this.detalleRef = this.dialogService.open(ModalModificarPagosComponent, {
      header: 'Modificar pago',
      style: {
        maxWidth: '876px',
        width: '100%',
      },
      data: {
        metodosPago: this.metodosPago,
        detallePago: this.item,
        detalleRegistro: this.detallePagoBitacora,
      },
    });
    this.detalleRef.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(
          Number(this.route.snapshot.queryParams.idPlanSfpa)
        );
        setTimeout(() => {
          this.buscarPagosBitacora(Number(this.item.idPagoSFPA));
        }, 900);
      }
    });
  }

  abrirModalEliminarPago(): void {
    const ref = this.dialogService.open(ModalEliminarPagoComponent, {
      header: 'Eliminar pago',
      style: {
        maxWidth: '876px',
        width: '100%',
      },
      data: {
        bitacora: this.detallePagoBitacora
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
        setTimeout(()=> {
          if(this.item.idPagoSFPA)this.buscarPagosBitacora(Number(this.item.idPagoSFPA));
        },500)
        const msg: string =
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(193);
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
      }
    });
  }

  abrirPanelNuevoPago(
    emergente: any,
    event: MouseEvent,
    item: PagosRealizados
  ): void {
    this.item = item;
    this.item.folio = this.datosGenerales.folio;
    emergente.toggle(event);
  }

  mostrarDetallePagos(detallePagoBitacora: PagosRealizados): void {
    this.buscarPagosBitacora(Number(detallePagoBitacora.idPagoSFPA));
    this.item = detallePagoBitacora;
    this.idPagoSFPA = detallePagoBitacora.idPagoSFPA;

  }

  buscarPagosBitacora(idPagoSFPA: number): void {
    this.ocultarBitacora = true;
    this.detallePagoService
      .obtenerDetalleBitacoraPago(idPagoSFPA)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error === false && respuesta.mensaje === 'Exito') {
            this.PagosBitacora = respuesta.datos;
          } else {
            this.alertaService.mostrar(TipoAlerta.Info, this.errorMsg);
            console.log(respuesta.mensaje);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.alertaService.mostrar(
            TipoAlerta.Info,
            this.errorMsg || 'El servicio no responde, no permite más llamadas.'
          );
        },
      });
  }

  validarMenuBitacora(bitacora: any): boolean {
    let fecha;
    if(bitacora.fechaPago){
      let [dia,mes,anio] = bitacora.fechaPago.split('/');
      fecha = anio + '-' + mes + '-' + dia
    }else{
      let [dia,mes,anio] = bitacora.fechaValeParitario.split('/');
      fecha = anio + '-' + mes + '-' + dia
    }
    return (this.fechaActual === fecha) && (bitacora.idEstatus != '0')
  }

  descargarComprobantePago(): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    const objetoReporte = this.generarObjetoReciboPago();


    this.detallePagoService.reciboPago(objetoReporte).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        let link = this.renderer.createElement('a');
        const file = respuesta;
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download', 'documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      error: (error: HttpErrorResponse): void => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    })
  }

  validarMostrarBotonHamburguesa(item:PagosRealizados): boolean {
    return item.idEstatus == 8 || item.idEstatus == 5;
  }

  generarObjetoReciboPago():any {
    let [parcialidad,total] = this.item.noPagos?.split('/')
    return {
      idPagoSfpa:this.item.idPagoSFPA,
      "parcialidad":`${parcialidad} de ${total}`,
      "importeRecibo":this.item.importePagado.toString()
    }
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
  }

}
