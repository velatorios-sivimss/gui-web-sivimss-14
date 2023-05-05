import {Component, OnInit} from '@angular/core';
import {tablaRin} from "../../../constants/tabla-rines";
import {ActivatedRoute} from "@angular/router";
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {VerificacionInicio} from "../../../models/verificacion-inicio.interface";
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";

@Component({
  selector: 'app-detalle-nueva-verificacion',
  templateUrl: './detalle-nueva-verificacion.component.html',
  styleUrls: ['./detalle-nueva-verificacion.component.scss']
})
export class DetalleNuevaVerificacionComponent implements OnInit {

  data = tablaRin;
  vehiculoSeleccionado!: VehiculoTemp;
  verificacion!: VerificacionInicio;
  fecha: string = obtenerFechaActual();

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
        this.vehiculoSeleccionado = JSON.parse(params.vehiculo);
        this.verificacion = JSON.parse(params.solicitud)
      }
    );
  }

  ngOnInit(): void {
  }

}
