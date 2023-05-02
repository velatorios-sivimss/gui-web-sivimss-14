import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OperadoresPorVelatorio} from "../../models/operadores-por-velatorio.interface";
import {Servicio} from "../../../servicios/models/servicio.interface";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {
  ModificarOperadoresPorVelatorioComponent
} from "../modificar-operadores-por-velatorio/modificar-operadores-por-velatorio.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-detalle-operadores-por-velatorio',
  templateUrl: './detalle-operadores-por-velatorio.component.html',
  styleUrls: ['./detalle-operadores-por-velatorio.component.scss'],
  providers: [DialogService]
})
export class DetalleOperadoresPorVelatorioComponent implements OnInit {

  @Input() operadorSeleccionado!:OperadoresPorVelatorio;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<boolean>();

  modificarRef!: DynamicDialogRef;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              public dialogService: DialogService,
              private alertaService: AlertaService) { }

  ngOnInit(): void {
    console.log(this.origen);
    console.log(this.operadorSeleccionado);

    if(this.origen === undefined){
       if(this.config?.data){
          this.operadorSeleccionado = this.config.data.operador;
          this.origen = this.config.data.origen;
       }
    }

  }

  abrirModalModificarOperador(): void {

    this.modificarRef = this.dialogService.open(ModificarOperadoresPorVelatorioComponent, {
      header: "Modificar operador",
      width: "920px",
      data: this.operadorSeleccionado,
    });

    this.modificarRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Operador modificado correctamente');
        this.ref.close();
      }
    })
  }

  aceptar(): void {
      this.confirmacionAceptar.emit(true);
      if(this.origen == "detalle"){
        this.ref.close();
        return;
      }
      if(this.origen == 'activar' || this.origen == 'desactivar'){
        this.ref.close(this.operadorSeleccionado);
      }
  }

  cancelar(): void {
    this.ref.close();
  }

  regresar(): void {

  }
}
