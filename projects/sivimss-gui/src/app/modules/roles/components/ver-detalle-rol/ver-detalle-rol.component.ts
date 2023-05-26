import {Component, OnInit} from '@angular/core';
import {Rol} from "../../models/rol.interface";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from "../../services/rol.service";
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import {ModificarRolComponent} from "../modificar-rol/modificar-rol.component";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

const MAX_WIDTH: string = "876px";

@Component({
  selector: 'app-ver-detalle-rol',
  templateUrl: './ver-detalle-rol.component.html',
  styleUrls: ['./ver-detalle-rol.component.scss']
})
export class VerDetalleRolComponent implements OnInit {

  rolSeleccionado!: Rol;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private rolService: RolService,
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.rolSeleccionado = this.config.data;
  }

  cambiarEstatus(rol: Rol): void {
    const rolEstatus: { idRol: number | undefined; estatusRol: number } = {
      "idRol": rol.idRol,
      "estatusRol": rol.estatusRol ? 1 : 0
    }
    const solicitudId: string = JSON.stringify(rolEstatus);
    this.rolService.cambiarEstatus(solicitudId).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus realizado');
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  aceptar(): void {
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  abrirModalModificarRol(): void {
    const MODIFICAR_CONFIG: DynamicDialogConfig = {
      header: "Modificar rol",
      width: MAX_WIDTH,
      data: this.rolSeleccionado
    }
    this.modificacionRef = this.dialogService.open(ModificarRolComponent, MODIFICAR_CONFIG);
    this.modificacionRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  obtenerRol(id: number): void {
    this.rolService.buscarPorId(id).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.rolSeleccionado = respuesta.datos[0];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  procesarRespuestaModal(respuesta: RespuestaModalRol = {}): void {
    if (respuesta.mensaje) {
      this.alertaService.mostrar(TipoAlerta.Exito, respuesta.mensaje);
    }
    if (respuesta.modificar) {
      this.abrirModalModificarRol();
    }
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }

}
