import {Component, OnInit} from '@angular/core';
import {Rol} from "../../models/rol.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RolPermisosService} from "../../services/rol-permisos.service";
import {RespuestaModalRol} from "projects/sivimss-gui/src/app/modules/roles-permisos/models/respuesta-modal.interface";

type SolicitudEstatus = Pick<Rol, "id">

@Component({
  selector: 'app-ver-detalle-rol-permisos',
  templateUrl: './ver-detalle-rol-permisos.component.html',
  styleUrls: ['./ver-detalle-rol-permisos.component.scss']
})
export class VerDetalleRolPermisosComponent implements OnInit {

  rolSeleccionado!: Rol;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private rolPermisosService: RolPermisosService
  ) {
  }

  ngOnInit(): void {
    this.rolSeleccionado = this.config.data;
  }

  cambiarEstatus(id: number): void {
    const idUsuario: SolicitudEstatus = {id}
    const solicitudId = JSON.stringify(idUsuario);
    this.rolPermisosService.cambiarEstatus(solicitudId).subscribe(
      () => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus realizado');
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  aceptar(): void {
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  abrirModalModificarUsuario(): void {
    const respuesta: RespuestaModalRol = { modificar: true };
    this.ref.close(respuesta);
  }


}
