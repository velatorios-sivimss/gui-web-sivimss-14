import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Vehiculo } from '../../models/vehiculo.interface';

@Component({
  selector: 'app-ver-detalle-vehiculo',
  templateUrl: './ver-detalle-vehiculo.component.html',
  styleUrls: ['./ver-detalle-vehiculo.component.scss']
})
export class VerDetalleVehiculoComponent implements OnInit {

  vehiculoSeleccionado!: Vehiculo;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
    this.vehiculoSeleccionado = this.config.data;
  }

  ngOnInit(): void { }

  cerrarDialogo(modificar: boolean = false): void {
    this.ref.close( { modificar });
  }

}
