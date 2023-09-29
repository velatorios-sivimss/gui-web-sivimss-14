import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Vehiculo} from '../../models/vehiculo.interface';

@Component({
  selector: 'app-detalle-vehiculo',
  templateUrl: './detalle-vehiculo.component.html',
  styleUrls: ['./detalle-vehiculo.component.scss']
})
export class DetalleVehiculoComponent {

  @Input() vehiculoSeleccionado!: Vehiculo;
  @Input() estatus: boolean = false;
  @Input() overlay: boolean = false;
  @Input() tipoEstatus: 'texto' | 'switch' = 'texto';
  @Output() modificar: EventEmitter<boolean> = new EventEmitter()


  abrirModalModificacionVehiculo(): void {
    this.modificar.emit(true);
  }

}
