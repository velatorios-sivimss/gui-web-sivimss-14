import {Component} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Vehiculo} from '../../models/vehiculo.interface';

@Component({
  selector: 'app-ver-detalle-vehiculo',
  templateUrl: './ver-detalle-vehiculo.component.html',
  styleUrls: ['./ver-detalle-vehiculo.component.scss']
})
export class VerDetalleVehiculoComponent {

  vehiculoSeleccionado!: Vehiculo;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    this.vehiculoSeleccionado = this.config.data;
  }

  cerrarDialogo(modificar: boolean = false): void {
    this.ref.close({modificar});
  }

}
