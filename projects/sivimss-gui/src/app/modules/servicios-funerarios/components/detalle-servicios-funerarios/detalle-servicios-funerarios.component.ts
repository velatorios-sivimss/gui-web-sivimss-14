import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
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
import { mapearArregloTipoDropdown } from '../../../../utils/funciones';
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
  selector: 'app-detalle-servicios-funerarios',
  templateUrl: './detalle-servicios-funerarios.component.html',
  styleUrls: ['./detalle-servicios-funerarios.component.scss'],
  providers: [DialogService, DescargaArchivosService],
})
export class DetalleServiciosFunerariosComponent implements OnInit {
  @Input() servicioFunerario: ServiciosFunerariosInterface[] = [];

  @ViewChild(OverlayPanel)
  overlayPanelHeader!: OverlayPanel;

  @ViewChild(OverlayPanel)
  overlayPanelBody!: OverlayPanel;
  fechaActual = moment().format('YYYY-MM-DD')
  ;

  readonly POSICION_METODO_PAGO: number = 0;

  detallePago: DetallePago[] = [];
  detallePagoBitacora!: PagosBitacora;
  PagosBitacora: PagosBitacora[] = [];
  metodosPago!: TipoDropdown[];

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

  constructor(
    private alertaService: AlertaService,
    private detallePagoService: DetallePagoService,
    private dialogService: DialogService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService
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
    this.detallePagoBitacora = detallePagoBitacora;
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
    this.detallePagoService
      .generarReporte(objetoReporte)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: any) => {
          this.usuario;
          const file: Blob = new Blob([respuesta], { type: 'application/pdf' });
          const url: string = window.URL.createObjectURL(file);
          this.descargaArchivosService
            .descargarArchivo(of(file), configuracionArchivo)
            .pipe(finalize(() => this.loaderService.desactivar()))
            .subscribe({
              next: (respuestaArchivo) => {
                if (respuestaArchivo) {
                  this.mensajeArchivoConfirmacion =
                    this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                  this.mostrarModalConfirmacion = true;
                }
              },
              error: (error) => {
                console.log(error);
                this.alertaService.mostrar(
                  TipoAlerta.Error,
                  this.mensajesSistemaService.obtenerMensajeSistemaPorId(64)
                );
              },
            });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al descargar reporte: ', error.message);
        },
      });
  }

  generarObjetoReporte(tipoReporte: string): any {
    return {
      idPlan: +this.route.snapshot.queryParams.idPlanSfpa,
      correoElectronico: this.datosGenerales.correo,
      paquete: this.datosGenerales.paquete,
      estado: this.datosGenerales.estado,
      nombreContratante: this.datosGenerales.nombre,
      tipoReporte: tipoReporte,
    };
  }

  abrirModalModificarPago(): void {
    const ref = this.dialogService.open(ModalModificarPagosComponent, {
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
    ref.onClose.subscribe((val: boolean) => {
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
    emergente.toggle(event);
  }

  mostrarDetallePagos(detallePagoBitacora: PagosRealizados): void {
    this.item = detallePagoBitacora;

    this.buscarPagosBitacora(Number(detallePagoBitacora.idPagoSFPA));
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
    bitacora.fechaPago ? fecha = moment(bitacora.fechaPago).format('YYYY-MM-DD') : fecha = moment(bitacora.fechaValeParitario).format('YYYY-MM-DD')
    return (this.fechaActual === fecha) && (bitacora.idEstatus != '0')
  }
}
