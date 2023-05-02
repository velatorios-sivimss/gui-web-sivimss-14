import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {RegistroOtorgamientoServicios} from "../../models/registro-otorgamiento-servicios-interface"

@Component({
  selector: 'app-detalle-registro-otorgamiento-servicios',
  templateUrl: './detalle-registro-otorgamiento-servicios.component.html',
  styleUrls: ['./detalle-registro-otorgamiento-servicios.component.scss']
})
export class DetalleRegistroOtorgamientoServiciosComponent implements OnInit {

  @Input() registroOtorgamientoSeleccionado!: RegistroOtorgamientoServicios;
  @Input() origen!: string;
  @Output() regresarPantalla = new EventEmitter<boolean>();

  constructor( public ref: DynamicDialogRef,
               public config: DynamicDialogConfig)
  { }

  ngOnInit(): void {
    if(this.config?.data){
      this.registroOtorgamientoSeleccionado = this.config.data;
      this.origen = "quitar";
    }
  }

  aceptar(): void{
    this.ref.close(true);
  }

  regresar(): void {
    this.regresarPantalla.emit(true);
  }

  cancelar(): void{
    this.ref.close();
  }
}
