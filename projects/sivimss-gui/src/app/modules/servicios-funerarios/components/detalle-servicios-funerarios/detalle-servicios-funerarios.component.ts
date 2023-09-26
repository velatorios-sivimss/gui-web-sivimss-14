import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DialogService} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {
  ModalEliminarPagoComponent
} from "projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-eliminar-pago/modal-eliminar-pago.component";
import {
  ModalRealizarPagoComponent
} from "projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-realizar-pago/modal-realizar-pago.component";
import {ServiciosFunerariosInterface, DetallePago} from "../../models/servicios-funerarios.interface";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {ActivatedRoute} from "@angular/router";
import {DetallePagoService} from "../../services/detalle-pago.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {DetalleServicios, PagosRealizados} from "../../models/detalle-servicios.interface";
import {ModalModificarPagosComponent} from "../modal-modificar-pagos/modal-modificar-pagos.component";
import {of} from "rxjs";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";

@Component({
  selector: 'app-detalle-servicios-funerarios',
  templateUrl: './detalle-servicios-funerarios.component.html',
  styleUrls: ['./detalle-servicios-funerarios.component.scss'],
  providers: [
    DialogService,DescargaArchivosService
  ]
})
export class DetalleServiciosFunerariosComponent implements OnInit {

  @Input() servicioFunerario: ServiciosFunerariosInterface[] = [];

  @ViewChild(OverlayPanel)
  overlayPanelHeader!: OverlayPanel;

  @ViewChild(OverlayPanel)
  overlayPanelBody!: OverlayPanel;

  readonly POSICION_METODO_PAGO: number = 0;

  detallePago: DetallePago[] = [];
  detalleSeleccionado!: PagosRealizados;
  metodosPago!: TipoDropdown[];


  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  opcionRealizarPagos = true;
  // totalPagado:number = 0;

  detalleServicio!: DetalleServicios;
  pagosRealizados!: PagosRealizados[];

  usuario = JSON.parse(localStorage.getItem('usuario') as string);
  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;

  constructor(
    private alertaService: AlertaService,
    private detallePagoService: DetallePagoService,
    private dialogService: DialogService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.metodosPago = mapearArregloTipoDropdown(respuesta[this.POSICION_METODO_PAGO].datos,
      'metodoPago', 'idMetodoPago');

    this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
  }

  consultarDetallePago(idPlanSfpa: number): void {
    this.detallePagoService.obtenerDetallePago(+idPlanSfpa).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.detalleServicio = {
          contratanteSubstituto: respuesta.datos.detallePlan.contratanteSubstituto,
          desNumeroPagos: respuesta.datos.detallePlan.desNumeroPagos,
          nombrePaquete: respuesta.datos.detallePlan.nombrePaquete,
          estatusPlan: respuesta.datos.detallePlan.estatusPlan,
          velatorio: respuesta.datos.detallePlan.velatorio,
          numFolio: respuesta.datos.detallePlan.numFolio,
          correo: respuesta.datos.detallePlan.correo,
          estado: respuesta.datos.detallePlan.estado,
          idPlan: respuesta.datos.detallePlan.idPlan,
          total: respuesta.datos.detallePlan.total,
          restante: respuesta.datos.detallePlan.restante ?? 0,
          totalPagado: respuesta.datos.detallePlan.restante ?
            Number(respuesta.datos.detallePlan.total) - Number(respuesta.datos.detallePlan.restante) :
            0
        }
        this.pagosRealizados = respuesta.datos.pagos || [];
        this.pagosRealizados.length < Number(this.detalleServicio.desNumeroPagos) ?
          this.opcionRealizarPagos = true :
          this.opcionRealizarPagos = false
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Info, errorMsg || 'El servicio no responde, no permite más llamadas.')
      }
    });

  }


  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.detallePago = [
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        }
      ];
      this.totalElementos = this.detallePago.length;
    }, 0)
  }


  abrirPanelHeader(event: MouseEvent): void {
    this.overlayPanelHeader.toggle(event);
  }

  abrirPanelBody(event: MouseEvent, detalleSeleccionado: PagosRealizados): void {
    this.detalleSeleccionado = detalleSeleccionado;
    this.overlayPanelBody.toggle(event);
  }

  abrirModalRealizarPago(): void {
    if (!this.opcionRealizarPagos) return;
    const ref = this.dialogService.open(ModalRealizarPagoComponent, {
      header: 'Realizar pago',
      style: {
        maxWidth: '876px',
        width: '100%'
      },
      data: {
        metodosPago: this.metodosPago,
        detallePago: this.detalleServicio,
        pagosRealizados: this.pagosRealizados
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
      }
    });
  }

  exportarArchivo(extension: string) : void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    if (extension == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    const objetoReporte = this.generarObjetoReporte(extension);
    this.detallePagoService.generarReporte(objetoReporte).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: any) =>{
        this.usuario;
        const file: Blob = new Blob([respuesta], {type: 'application/pdf'});
        const url: string = window.URL.createObjectURL(file);
        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())
        ).subscribe(
          {
            next:(repuesta) => {
              if (respuesta) {
                this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                this.mostrarModalConfirmacion = true;
              }
            },
            error:(error) => {
              this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
            }
          }
        )
      },
      error: (error:HttpErrorResponse) => {
        console.error('Error al descargar reporte: ', error.message);
      }
    });
  }

  generarObjetoReporte(tipoReporte:string): any {
    return {
      idVelatorio: this.usuario.idVelatorio,
      folioPlan: this.detalleServicio.numFolio,
      fechaInicio: null,
      fechaFin: null,
      nombreContratante: this.detalleServicio.contratanteSubstituto,
      tipoReporte:tipoReporte
    }
  }

  abrirModalModificarPago(): void {
    const ref = this.dialogService.open(ModalModificarPagosComponent, {
      header: 'Modificar pago',
      style: {
        maxWidth: '876px',
        width: '100%'
      },
      data: {
        metodosPago: this.metodosPago,
        detallePago: this.detalleServicio,
        detalleRegistro: this.detalleSeleccionado
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
      }
    });
  }

  abrirModalEliminarPago(): void {
    const ref = this.dialogService.open(ModalEliminarPagoComponent, {
      header: 'Eliminar pago',
      style: {
        maxWidth: '876px',
        width: '100%'
      },
      data: {
        detalleRegistro: this.detalleSeleccionado
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        this.consultarDetallePago(this.route.snapshot.queryParams.idPlanSfpa);
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(193);
        this.alertaService.mostrar(TipoAlerta.Exito, msg)
      }
    });
  }


}
