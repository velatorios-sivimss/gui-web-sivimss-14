import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../models/usuario.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UsuarioService} from "../../services/usuario.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type SolicitudEstatus = Pick<Usuario, "id">
type DetalleUsuario = Required<Usuario> & {
  oficina: string, rol: string, delegacion: string, velatorio: string,
  contrasenia: string, desEdoNacimiento: string
};

@Component({
  selector: 'app-cambio-estatus-usuario',
  templateUrl: './cambio-estatus-usuario.component.html',
  styleUrls: ['./cambio-estatus-usuario.component.scss']
})
export class CambioEstatusUsuarioComponent implements OnInit {

  usuarioSeleccionado!: DetalleUsuario;
  estatus!: boolean;
  title!: string;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.obtenerUsuario();
  }

  ngOnInit(): void {
    this.obtenerUsuario();
  }

  obtenerUsuario(): void {
    this.usuarioSeleccionado = this.config.data;
    this.usuarioSeleccionado.contrasenia = '*'.repeat(this.usuarioSeleccionado.contrasenia.length);
    this.estatus = !!this.usuarioSeleccionado.estatus;
    this.title = this.usuarioSeleccionado.estatus ? 'Desactivar' : 'Activar';
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  cancelar(): void {
    this.ref.close()
  }

  cambiarEstatus(): void {
    const idUsuario: SolicitudEstatus = {id: this.usuarioSeleccionado.id}
    this.cargadorService.activar();
    this.usuarioService.cambiarEstatus(idUsuario)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (): void => this.procesarRespuestaCambioEstatus(),
        error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
      });
  }

  procesarRespuestaCambioEstatus(): void {
    const estatus: string = this.usuarioSeleccionado.estatus ? "Desactivado" : "Activado";
    const mensaje: string = `${estatus} correctamente`;
    const respuesta: RespuestaModalUsuario = {actualizar: false};
    respuesta.actualizar = true;
    respuesta.mensaje = mensaje;
    this.ref.close(respuesta);
  }
}
