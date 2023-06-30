import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { UsuarioContratante, ConfirmarContratante } from "../../models/usuario-contratante.interface";
import { OverlayPanel } from "primeng/overlaypanel";
import { ModificarContratantesComponent } from "../modificar-contratantes/modificar-contratantes.component";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { UsuariosComponent } from "../../../usuarios/components/usuarios/usuarios.component";
import { ALERTA_ESTATUS, MENSAJE_CONFIRMACION } from "../../constants/alertas";
import { ContratantesService } from '../../services/contratantes.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

@Component({
  selector: 'app-detalle-contratantes',
  templateUrl: './detalle-contratantes.component.html',
  styleUrls: ['./detalle-contratantes.component.scss'],
  providers: [DialogService]
})
export class DetalleContratantesComponent implements OnInit {
  @Input() contratante!: UsuarioContratante;
  @Input() origen!: string;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  cambiarEstatusRef!: DynamicDialogRef;
  modificarRef!: DynamicDialogRef;

  mensaje: string = "";
  retorno: ConfirmarContratante = {};

  tipoMensaje: string[] = MENSAJE_CONFIRMACION;
  alertaEstatus: string[] = ALERTA_ESTATUS;

  constructor(
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private contratantesService: ContratantesService,
  ) { }

  ngOnInit(): void {
    if (this.contratante == undefined) {
      if (this.config?.data) {
        this.contratante = this.config.data.contratante;
        this.origen = this.config.data.origen;
        if (this.origen == "estatus") {
          this.mensaje = this.contratante.estatus ? this.tipoMensaje[1] : this.tipoMensaje[0];
        }
      }
    }
    if (this.origen == "modificar") {
      this.mensaje = this.tipoMensaje[2];
    }
  }

  aceptar(): void {
    switch (this.origen) {
      case 'detalle':
        this.ref.close();
        break;
      case 'modificar':
        // this.confirmacionAceptar.emit({ estatus: true, origen: this.origen });
        break;
      case 'estatus':
        this.cambiarEstatus();
        break;
    }
  }

  cancelar(): void {
    this.ref.close();
  }

  cambiarEstatus() {
    this.contratantesService.cambiarEstatus({ idContratante: this.contratante.idContratante, estatus: !this.contratante.estatus }).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, this.contratante?.estatus ? this.alertaEstatus[1] : this.alertaEstatus[0]);
          this.ref.close({ estatus: true });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  abrirModalModificarContratante(): void {
    this.modificarRef = this.dialogService.open(ModificarContratantesComponent, {
      header: "Modificar contratante",
      width: "920px",
      data: { contratante: this.contratante, origen: "modificar" },
    });
    this.modificarRef.onClose.subscribe((resultado: ConfirmarContratante) => {
      if (resultado.estatus) {
        this.ref.close();
        this.alertaService.mostrar(TipoAlerta.Exito, this.alertaEstatus[2]);
      }
    });
  }
}
