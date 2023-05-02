import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Vehiculo } from '../../models/vehiculo.interface';

@Component({
  selector: 'app-detalle-vehiculo',
  templateUrl: './detalle-vehiculo.component.html',
  styleUrls: ['./detalle-vehiculo.component.scss']
})
export class DetalleVehiculoComponent implements OnInit {

  @Input() vehiculoSeleccionado!: Vehiculo;
  @Input() estatus: boolean = false;
  @Input() overlay: boolean = false;
  @Input() tipoEstatus: 'texto' | 'switch' = 'texto';
  @Output() modificar: EventEmitter<boolean> = new EventEmitter()

  constructor() { }

  ngOnInit(): void { }

  abrirModalModificacionVehiculo(): void {
    this.modificar.emit(true);
  }

}
