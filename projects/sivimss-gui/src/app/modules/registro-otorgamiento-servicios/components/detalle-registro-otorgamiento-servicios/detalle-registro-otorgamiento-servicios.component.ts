import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OtorgamientoServicios } from '../../models/otorgamiento-servicios-interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { RegistroOtorgamientoServiciosService } from '../../services/registro-otorgamiento-servicios.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';

@Component({
  selector: 'app-detalle-registro-otorgamiento-servicios',
  templateUrl: './detalle-registro-otorgamiento-servicios.component.html',
  styleUrls: ['./detalle-registro-otorgamiento-servicios.component.scss'],
})
export class DetalleRegistroOtorgamientoServiciosComponent implements OnInit {
  @Input() registroOtorgamientoSeleccionado!: OtorgamientoServicios;
  @Input() origen!: string;
  @Output() regresarPantalla = new EventEmitter<boolean>();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private servicioOtorgamiento: RegistroOtorgamientoServiciosService
  ) {}

  ngOnInit(): void {
    if (this.origen != 'situar') {
      this.registroOtorgamientoSeleccionado = this.config.data;
      this.origen = 'quitar';
    }
  }

  aceptar(): void {
    let datos = {
      idHistorialServicio:
        this.registroOtorgamientoSeleccionado.idHistorialServicio,
    };

    if (this.origen == 'situar') {
      let check =
        this.registroOtorgamientoSeleccionado.indCertificado == null
          ? null
          : Number(this.registroOtorgamientoSeleccionado.indCertificado);
      let datos = {
        idOrdenServicio: this.registroOtorgamientoSeleccionado.idOrdenServicio,
        indCertificado: check,
        idTipoServicio: this.registroOtorgamientoSeleccionado.idTipoServicio,
        fechaSolicitud: this.registroOtorgamientoSeleccionado.fecha,
        desNotas: this.registroOtorgamientoSeleccionado.desNotas,
      };
      this.nuevoRegistro(datos);
    } else {
      this.quitarRegistro(datos);
    }
  }

  nuevoRegistro(datos: any): void {
    this.loaderService.activar();
    this.servicioOtorgamiento
      .nuevoOTorgamiento(datos)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'Error al guardar la información. Intenta nuevamente.'
            );

            return;
          }

          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          this.alertaService.mostrar(TipoAlerta.Exito, ExitoMsg);
          this.ref.close(true);
        },
        error: (error: HttpErrorResponse) => {
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'Error al guardar la información. Intenta nuevamente. '
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              'Error al guardar la información. Intenta nuevamente.'
            );
          }
        },
      });
  }

  quitarRegistro(datos: any): void {
    this.loaderService.activar();
    this.servicioOtorgamiento
      .quitarOTorgamiento(datos)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'Error al guardar la información. Intenta nuevamente.'
            );

            return;
          }

          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          this.alertaService.mostrar(TipoAlerta.Exito, ExitoMsg);

          this.ref.close(true);
        },
        error: (error: HttpErrorResponse) => {
          try {
            console.error(error);
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            console.error(error);
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        },
      });
  }

  regresar(): void {
    this.regresarPantalla.emit(true);
  }

  cancelar(): void {
    this.ref.close();
  }
}
