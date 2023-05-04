import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../models/usuario.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type DetalleUsuario = Required<Usuario> & { oficina: string, rol: string, delegacion: string, velatorio: string };

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
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService
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
          this.estatus = !!this.usuarioSeleccionado.estatus;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }
}
