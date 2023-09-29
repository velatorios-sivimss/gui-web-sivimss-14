import {Component} from '@angular/core';
import {Velatorio} from "../../models/velatorio.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {VelatorioService} from "../../services/velatorio.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RespuestaModalUsuario} from "../../../usuarios/models/respuestaModal.interface";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";

interface SolicitudEstatus {
  idVelatorio: number,
  indEstatus: number
}

@Component({
  selector: 'app-cambio-estatus-velatorio',
  templateUrl: './cambio-estatus-velatorio.component.html',
  styleUrls: ['./cambio-estatus-velatorio.component.scss']
})
export class CambioEstatusVelatorioComponent {

  velatorioSeleccionado!: Velatorio;
  title!: string;

  constructor(private alertaService: AlertaService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private velatorioService: VelatorioService,
              private cargadorService: LoaderService
  ) {
    this.velatorioSeleccionado = this.config.data;
    this.title = this.velatorioSeleccionado.estatus ? 'Desactivar' : 'Activar';
  }

  cancelar(): void {
    this.ref.close()
  }

  cambiarEstatus(): void {
    const estatus: SolicitudEstatus = this.obtenerSolicitudEstatus();
    const respuesta: RespuestaModalUsuario = {mensaje: "Cambio de estatus realizado", actualizar: true};
    this.cargadorService.activar();
    this.velatorioService.cambiarEstatus(estatus)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (): void => {
          this.ref.close(respuesta);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  obtenerSolicitudEstatus(): SolicitudEstatus {
    return {
      idVelatorio: +this.velatorioSeleccionado.idVelatorio,
      indEstatus: this.velatorioSeleccionado.estatus ? 0 : 1
    }
  }
}
