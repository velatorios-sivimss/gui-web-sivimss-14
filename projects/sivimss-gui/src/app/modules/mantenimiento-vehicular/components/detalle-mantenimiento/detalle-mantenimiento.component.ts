import {Component, OnInit} from '@angular/core';
import {tablaRin} from "../../constants/tabla-rines";

@Component({
  selector: 'app-detalle-mantenimiento',
  templateUrl: './detalle-mantenimiento.component.html',
  styleUrls: ['./detalle-mantenimiento.component.scss']
})
export class DetalleMantenimientoComponent implements OnInit {

  data = tablaRin;

  constructor() {
  }

  ngOnInit(): void {
  }

  protected readonly tablaRin = tablaRin;
}
