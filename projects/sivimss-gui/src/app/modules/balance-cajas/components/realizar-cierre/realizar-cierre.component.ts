import {Component} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BalanceCajaService} from '../../services/balance-caja.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {mensajes} from '../../../reservar-salas/constants/mensajes';
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-realizar-cierre',
  templateUrl: './realizar-cierre.component.html',
  styleUrls: ['./realizar-cierre.component.scss']
})
export class RealizarCierreComponent {

  modificarPagoForm!: FormGroup;
  filtrosBalanceSeleccionados: any;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private readonly referencia: DynamicDialogRef,
    private balanceCajaService: BalanceCajaService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService
  ) {
  }


  realizarCierre(): void {
    this.loaderService.activar();
    this.balanceCajaService.realizarCierre(this.balanceCajaService.filtrosBalanceSeleccionados)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, "Cierre de caja efectuado correctamente");
          this.referencia.close(false);
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get ref() {
    return this.modificarPagoForm.controls;
  }

}
