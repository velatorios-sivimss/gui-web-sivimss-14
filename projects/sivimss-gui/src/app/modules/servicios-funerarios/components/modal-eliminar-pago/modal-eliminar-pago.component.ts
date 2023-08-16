import { Component, OnInit } from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {DetallePagoService} from "../../services/detalle-pago.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-modal-eliminar-pago',
  templateUrl: './modal-eliminar-pago.component.html',
  styleUrls: ['./modal-eliminar-pago.component.scss']
})
export class ModalEliminarPagoComponent implements OnInit {

  constructor(public readonly ref: DynamicDialogRef,
              public readonly config: DynamicDialogConfig,
              private alertaService: AlertaService,
              private detallePagoService: DetallePagoService,
              private dialogService: DialogService,
              private mensajesSistemaService: MensajesSistemaService,
              private loaderService: LoaderService) {
  }

  ngOnInit(): void {
  }

  desactivar(): void {
    this.loaderService.activar();
    this.detallePagoService.desactivarPago(Number(this.config.data.detalleRegistro.idBitacoraPago)).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        this.ref.close(true)
        this.alertaService.mostrar(TipoAlerta.Exito,'Pago eliminado correctamente.')
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Info, errorMsg || 'El servicio no responde, no permite más llamadas.')
      }
    })
  }

  cerrarModal(respuesta: boolean) {
    this.ref.close(respuesta);
  }

}
