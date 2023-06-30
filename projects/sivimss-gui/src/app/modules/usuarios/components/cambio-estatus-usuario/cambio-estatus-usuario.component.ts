import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../models/usuario.interface";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UsuarioService} from "../../services/usuario.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type SolicitudEstatus = Pick<Usuario, "id">
type DetalleUsuario = Required<Usuario> & { oficina: string, rol: string, delegacion: string, velatorio: string };

@Component({
  selector: 'app-cambio-estatus-usuario',
  templateUrl: './cambio-estatus-usuario.component.html',
  styleUrls: ['./cambio-estatus-usuario.component.scss']
})
export class CambioEstatusUsuarioComponent implements OnInit {

  usuarioSeleccionado!: DetalleUsuario;
  id!: number;
  estatus!: boolean;
  title!: string;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.id = this.config.data;
    this.obtenerUsuario(this.id);
  }

  obtenerUsuario(id: number): void {
    this.cargadorService.activar();
    this.usuarioService.buscarPorId(id)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.usuarioSeleccionado = respuesta.datos[0];
          this.estatus = !!this.usuarioSeleccionado.estatus;
          this.title = this.usuarioSeleccionado.estatus ? 'Desactivar' : 'Activar';
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  cancelar(): void {
    this.ref.close()
  }

  cambiarEstatus(): void {
    const idUsuario: SolicitudEstatus = {id: this.id}
    const estatus: string = this.usuarioSeleccionado.estatus ? "Desactivado" : "Activado";
    const mensaje: string = `${estatus} correctamente`;
    const respuesta: RespuestaModalUsuario = {actualizar: false};
    this.cargadorService.activar();
    this.usuarioService.cambiarEstatus(idUsuario)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (): void => {
          respuesta.actualizar = true;
          respuesta.mensaje = mensaje;
          this.ref.close(respuesta);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }
}
