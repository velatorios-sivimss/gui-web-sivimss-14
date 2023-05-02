import { Proveedores } from './../../models/proveedores.interface';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-ver-detalle-proveedor',
  templateUrl: './ver-detalle-proveedor.component.html',
  styleUrls: ['./ver-detalle-proveedor.component.scss']
})
export class VerDetalleProveedorComponent implements OnInit {

  proveedorSeleccionado!: Proveedores;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
    this.proveedorSeleccionado = this.config.data;
  }

  ngOnInit(): void { }

  cerrarDialogo(modificar: boolean = false) {
    this.ref.close( { modificar });
  }


  cancelar(): void {
    this.ref.close()
  }


}
