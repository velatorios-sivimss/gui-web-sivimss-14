import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../models/usuario.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type DetalleUsuario = Required<Usuario> & {
  oficina: string, rol: string, delegacion: string, velatorio: string,
  contrasenia: string, desEdoNacimiento: string
};

@Component({
  selector: 'app-ver-detalle-usuario',
  templateUrl: './ver-detalle-usuario.component.html',
  styleUrls: ['./ver-detalle-usuario.component.scss']
})
export class VerDetalleUsuarioComponent implements OnInit {

  usuarioSeleccionado!: DetalleUsuario;
  id!: number;
  estatus!: boolean;

  constructor(
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

  aceptar(): void {
    const respuesta: RespuestaModalUsuario = {actualizar: false};
    this.ref.close(respuesta);
  }

  abrirModalModificarUsuario(): void {
    const respuesta: RespuestaModalUsuario = {modificar: true};
    this.ref.close(respuesta);
  }

  obtenerUsuario(id: number): void {
    this.cargadorService.activar();
    this.usuarioService.buscarPorId(id)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.usuarioSeleccionado = respuesta.datos[0];
          this.usuarioSeleccionado.contrasenia = '*'.repeat(this.usuarioSeleccionado.contrasenia.length);
          this.estatus = !!this.usuarioSeleccionado.estatus;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }
}
