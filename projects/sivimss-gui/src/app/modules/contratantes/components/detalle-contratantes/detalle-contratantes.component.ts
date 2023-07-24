import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { TIPO_SEXO, CATALOGO_SEXO } from '../../constants/catalogos-complementarios';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-detalle-contratantes',
  templateUrl: './detalle-contratantes.component.html',
  styleUrls: ['./detalle-contratantes.component.scss'],
  providers: [DialogService]
})
export class DetalleContratantesComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @Input() contratante!: UsuarioContratante;

  @Input() origen!: string;

  @Output()
  confirmacionAceptar: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  cancelarConfirmacion: EventEmitter<boolean> = new EventEmitter<boolean>();

  cambiarEstatusRef!: DynamicDialogRef;
  modificarRef!: DynamicDialogRef;

  mensaje: string = "";
  retorno: ConfirmarContratante = {};
  tipoSexoDesc: string = '';
  tipoMensaje: string[] = MENSAJE_CONFIRMACION;
  alertaEstatus: string[] = ALERTA_ESTATUS;

  constructor(
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private contratantesService: ContratantesService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data && this.origen !== "modificar") {
      this.contratante = this.config.data.contratante;
      this.origen = this.config.data.origen;
      if (this.origen === "estatus" || this.origen === "detalle") {
        this.mensaje = this.contratante.estatus ? this.tipoMensaje[1] : this.tipoMensaje[0];
        this.obtenerDetalleContratante();
      }
    }
    if (this.origen == "modificar") {
      this.mensaje = this.tipoMensaje[2];
      this.tipoSexoDesc = TIPO_SEXO[this.contratante.numSexo || 1];
    }
  }

  obtenerDetalleContratante() {
    if (this.contratante.idContratante) {
      this.contratantesService.obtenerDetalleContratante(this.contratante.idContratante).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.codigo === 200) {
            this.contratante = respuesta?.datos[0] || [];
            this.tipoSexoDesc = TIPO_SEXO[this.contratante.numSexo || 1];
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.ref.close({ estatus: false });
        }
      });
    }
  }

  aceptar(): void {
    switch (this.origen) {
      case 'detalle':
        this.ref.close({ estatus: false });
        break;
      case 'modificar':
        this.confirmacionAceptar.emit(true);
        break;
      case 'estatus':
        this.cambiarEstatus();
        break;
    }
  }

  cancelar(): void {
    switch (this.origen) {
      case 'detalle':
      case 'estatus':
        this.ref.close({ estatus: false });
        break;
      case 'modificar':
        this.cancelarConfirmacion.emit(true);
        break;
    }
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
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  abrirModalModificarContratante(): void {
    this.ref.close({ estatus: false });
    document.body.style.overflow = 'hidden';
    this.modificarRef = this.dialogService.open(ModificarContratantesComponent, {
      header: "Modificar datos generales",
      width: "920px",
      data: { contratante: this.contratante, origen: "modificar" },
    });
    this.modificarRef.onClose.subscribe((resultado: ConfirmarContratante) => {
      document.body.style.overflow = 'scroll';
      if (resultado.estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, this.alertaEstatus[2]);
        this.ref.close({ estatus: true });
      }
    });
  }
}
