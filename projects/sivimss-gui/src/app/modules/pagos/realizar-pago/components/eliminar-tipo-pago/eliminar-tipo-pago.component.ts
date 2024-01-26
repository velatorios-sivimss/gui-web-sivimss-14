import {Component} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {MetodoPago} from "../../modelos/detallePago.interface";

@Component({
  selector: 'app-eliminar-tipo-pago',
  templateUrl: './eliminar-tipo-pago.component.html',
  styleUrls: ['./eliminar-tipo-pago.component.scss']
})
export class EliminarTipoPagoComponent {

  registroMetodoPago!: MetodoPago;
  total!: number;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private realizarPagoService: RealizarPagoService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
  ) {
    this.registroMetodoPago = this.config.data.pago;
    this.total = this.config.data.total;
  }


  guardar(): void {
    this.realizarPagoService.cancelarMetodoPago(this.registroMetodoPago.idPagoDetalle).subscribe({
      next: (): void => this.manejoRespuestaExitosaPago(),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaExitosaPago(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Pago eliminado correctamente');
    this.ref.close();
    this.actualizarPagina();
  }

  private manejoRespuestaErrorPago(error: HttpErrorResponse): void {
    const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
    console.log(error);
  }

  actualizarPagina(): void {
    window.location.reload();
  }
}
