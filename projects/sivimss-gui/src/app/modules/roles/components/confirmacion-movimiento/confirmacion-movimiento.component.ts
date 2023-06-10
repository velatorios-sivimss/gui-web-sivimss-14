import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Rol} from "../../models/rol.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-confirmacion-movimiento',
  templateUrl: './confirmacion-movimiento.component.html',
  styleUrls: ['./confirmacion-movimiento.component.scss']
})
export class ConfirmacionMovimientoComponent implements OnInit {

  @Input() datosRolModificar!: Rol;
  @Input() origen!: number;
  @Output() confirmacionAceptar = new EventEmitter<boolean>();

  datosRol!: Rol;


  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    debugger;
    this.datosRol = this.config.data;
  }


  confirmar(): void {
    this.confirmacionAceptar.emit(true);
    this.ref.close({datosRol: this.datosRol, estatus: true});
  }

  cancelar(): void {
    this.ref.close({datosRol: null, estatus: false});
  }

}
