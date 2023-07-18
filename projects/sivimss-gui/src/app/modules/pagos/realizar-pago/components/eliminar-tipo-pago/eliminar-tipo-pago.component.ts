import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RealizarPagoService} from "../../services/realizar-pago.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {ActivatedRoute, Router} from "@angular/router";

interface MetodoPago {
  fechaPago: string
  idPagoDetalle: number
  importe: number
  metodoPago: string
  nomBanco: string
  numAutorizacion: string
}

@Component({
  selector: 'app-eliminar-tipo-pago',
  templateUrl: './eliminar-tipo-pago.component.html',
  styleUrls: ['./eliminar-tipo-pago.component.scss']
})
export class EliminarTipoPagoComponent implements OnInit {

  registroMetodoPago!: MetodoPago;
  total!: number;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private realizarPagoService: RealizarPagoService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private router: Router,
  ) {
    this.registroMetodoPago = this.config.data.pago;
    this.total = this.config.data.total;
  }

  ngOnInit(): void {
  }

  guardar(): void {
    this.realizarPagoService.cancelarMetodoPago(this.registroMetodoPago.idPagoDetalle).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago cancelado correctamente');
        this.ref.close();
        this.actualizarPagina();
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  actualizarPagina(): void {
    const currentUrl: string = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      void this.router.navigate([currentUrl]);
    });
  }
}
