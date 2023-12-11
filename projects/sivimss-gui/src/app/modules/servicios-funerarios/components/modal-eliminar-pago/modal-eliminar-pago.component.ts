import {Component} from '@angular/core';
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
export class ModalEliminarPagoComponent {

  constructor(public readonly ref: DynamicDialogRef,
              public readonly config: DynamicDialogConfig,
              private alertaService: AlertaService,
              private detallePagoService: DetallePagoService,
              private dialogService: DialogService,
              private mensajesSistemaService: MensajesSistemaService,
              private loaderService: LoaderService) {
  }

  desactivar(): void {
    this.loaderService.activar();
    const objetoDesactivarPago = this.generarObjetoDesactivarPago(this.config.data.bitacora);
    this.detallePagoService.desactivarPago(objetoDesactivarPago).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ref.close(true)
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago eliminado correctamente.')
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.')
      }
    });
  }

  generarObjetoDesactivarPago(objeto:any):any {
    return {
      idPagoBitacora: objeto.idBitacora,
      idPagoParcialidad:objeto.idPagoParcialidad,
      idPlan:objeto.idPlan,
      totalParcialidades:objeto.totalParcialidades,
      idPrimerParcialidad:objeto.idPrimerParcialidad,
      idUltimaParcialidad:objeto.idUltimaParcialidad
    }
  }

  cerrarModal(respuesta: boolean) {
    this.ref.close(respuesta);
  }

}
