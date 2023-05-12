import {Component, OnInit} from '@angular/core';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {VehiculoMantenimiento} from "../../../models/vehiculoMantenimiento.interface";
import {ResumenRegistro} from "../../../models/resumenRegistro.interface";
import {ActivatedRoute} from "@angular/router";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-detalle-registro-mantenimiento',
  templateUrl: './detalle-registro-mantenimiento.component.html',
  styleUrls: ['./detalle-registro-mantenimiento.component.scss']
})
export class DetalleRegistroMantenimientoComponent implements OnInit {

  fecha: string = obtenerFechaActual();
  vehiculoSeleccionado!: VehiculoMantenimiento;
  registro!: ResumenRegistro;
  idRegistro!: number;

  constructor(private route: ActivatedRoute,
              private cargadorService: LoaderService,
              private mantenimientoVehicularService: MantenimientoVehicularService,
              private mensajesSistemaService: MensajesSistemaService
  ) {
    this.route.queryParams.subscribe(params => {
        if (params.id) {
          this.idRegistro = params.id;
        }
        if (params.vehiculo) {
          this.vehiculoSeleccionado = JSON.parse(params.vehiculo);
        }
        if (params.solicitud) {
          this.registro = JSON.parse(params.solicitud);
        }
      }
    );
  }

  ngOnInit(): void {
  }

}
