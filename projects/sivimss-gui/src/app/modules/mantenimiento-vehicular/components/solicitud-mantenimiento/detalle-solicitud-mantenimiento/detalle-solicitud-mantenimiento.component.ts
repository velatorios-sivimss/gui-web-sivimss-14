import {Component, OnInit} from '@angular/core';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {ResumenAsignacion} from "../../../models/resumenAsignacion.interface";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detalle-solicitud-mantenimiento',
  templateUrl: './detalle-solicitud-mantenimiento.component.html',
  styleUrls: ['./detalle-solicitud-mantenimiento.component.scss']
})
export class DetalleSolicitudMantenimientoComponent implements OnInit {

  fecha: string = obtenerFechaActual();
  vehiculoSeleccionado!: VehiculoTemp;
  asignacion!: ResumenAsignacion;

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
        this.vehiculoSeleccionado = JSON.parse(params.vehiculo);
        this.asignacion = JSON.parse(params.solicitud)
      }
    );
  }

  ngOnInit(): void {
  }

}
