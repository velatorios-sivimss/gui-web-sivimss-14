import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UsuarioContratante,ConfirmarContratante} from "../../models/usuario-contratante.interface";
import {OverlayPanel} from "primeng/overlaypanel";
import {ModificarContratantesComponent} from "../modificar-contratantes/modificar-contratantes.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {UsuariosComponent} from "../../../usuarios/components/usuarios/usuarios.component";
import {ALERTA_ESTATUS, MENSAJE_CONFIRMACION} from "../../constants/alertas";

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
  retorno:ConfirmarContratante = {};

  tipoMensaje: string[] = MENSAJE_CONFIRMACION;
  alertaEstatus: string[] = ALERTA_ESTATUS;

  constructor(
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    if(this.contratante == undefined){
      if(this.config?.data){
          this.contratante = this.config.data.contratante;
          this.origen = this.config.data.origen;
          if(this.origen == "estatus"){
            this.mensaje = this.contratante.estatus?this.tipoMensaje[0]:this.tipoMensaje[1];
          }
      }
    }
    if(this.origen == "modificar"){
      this.mensaje = this.tipoMensaje[2];
    }
  }

  cambiarEstatus(contratante?: UsuarioContratante): void {
    this.cambiarEstatusRef = this.dialogService.open(DetalleContratantesComponent, {
      header:contratante?.estatus? "Activar contratante":"Desactivar contratante",
      width:"920px",
      data: {contratante:contratante, origen: "estatus"},
    })

    this.cambiarEstatusRef.onClose.subscribe((resultado:ConfirmarContratante) => {
      if(resultado.estatus){
        this.ref.close();
        this.alertaService.mostrar(TipoAlerta.Exito,
          resultado.usuarioContratante?.estatus?this.alertaEstatus[0]:this.alertaEstatus[1] );
      }
    });
  }

  aceptar(): void {
    this.retorno = {usuarioContratante:this.contratante, estatus: true}
    this.ref.close(this.retorno);
  }

  cancelar(): void {
    this.ref.close();
  }

  abrirModalModificarContratante(): void {
    this.modificarRef = this.dialogService.open(ModificarContratantesComponent, {
      header:"Modificar contratante",
      width:"920px",
      data: {contratante:this.contratante, origen: "modificar"},
    });
    this.modificarRef.onClose.subscribe((resultado:ConfirmarContratante) => {
      if(resultado.estatus){
        this.ref.close();
        this.alertaService.mostrar(TipoAlerta.Exito, this.alertaEstatus[2]);
      }
    });
  }
}
