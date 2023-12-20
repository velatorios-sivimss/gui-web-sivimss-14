import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../models/usuario.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";

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
  estatus!: boolean;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    this.obtenerUsuario();
  }

  aceptar(): void {
    const respuesta: RespuestaModalUsuario = {actualizar: false};
    this.ref.close(respuesta);
  }

  abrirModalModificarUsuario(): void {
    const respuesta: RespuestaModalUsuario = {modificar: true};
    this.ref.close(respuesta);
  }

  obtenerUsuario(): void {
    this.usuarioSeleccionado = this.config.data;
    this.usuarioSeleccionado.contrasenia = '*'.repeat(this.usuarioSeleccionado.contrasenia.length);
    this.estatus = !!this.usuarioSeleccionado.estatus;
  }

}
