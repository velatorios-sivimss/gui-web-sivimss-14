import {Component, OnInit} from '@angular/core';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {ResumenAsignacion} from "../../../models/resumenAsignacion.interface";
import {ActivatedRoute} from "@angular/router";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {finalize} from "rxjs/operators";

interface RespuestaAsignacion {
  "DES_USO": string,
  "DES_NUMMOTOR": string,
  "NOM_VELATORIO": string,
  "ID_MTTOMODALIDAD": number,
  "ID_MTTOMODALIDAD_DET": number,
  "DES_PLACAS": string,
  "DES_NUMSERIE": string,
  "DES_DELEGACION": string,
  "DES_MTTO_TIPO": string,
  "DES_MTTO_CORRECTIVO": string,
  "ID_MTTO_TIPO": number,
  "ID_MTTOESTADO": number,
  "DES_MODELO": string,
  "DES_MODALIDAD": string,
  "ID_MTTO_SOLICITUD": number,
  "DES_MARCA": string,
  "IND_ESTATUS": boolean,
  "ID_VELATORIO": number,
  "DES_MTTOESTADO": string,
  "FEC_REGISTRO": string,
  "ID_VEHICULO": number,
  "ID_DELEGACION": number,
  "FEC_ALTA": string,
  "IND_ACTIVO": boolean
}

@Component({
  selector: 'app-detalle-solicitud-mantenimiento',
  templateUrl: './detalle-solicitud-mantenimiento.component.html',
  styleUrls: ['./detalle-solicitud-mantenimiento.component.scss']
})
export class DetalleSolicitudMantenimientoComponent implements OnInit {

  fecha: string = obtenerFechaActual();
  vehiculoSeleccionado!: VehiculoTemp;
  asignacion!: ResumenAsignacion;
  idRegistro!: number;

  constructor(private route: ActivatedRoute,
              private cargadorService: LoaderService,
              private mantenimientoVehicularService: MantenimientoVehicularService) {
    this.route.queryParams.subscribe(params => {
        if (params.id) {
          this.idRegistro = params.id;
        }
        if (params.vehiculo) {
          this.vehiculoSeleccionado = JSON.parse(params.vehiculo);
        }
        if (params.asignacion) {
          this.asignacion = JSON.parse(params.solicitud);
        }
      }
    );
  }

  ngOnInit(): void {
    this.validarAsignacion();
  }

  validarAsignacion(): void {
    if (!this.idRegistro) return;
    this.cargadorService.activar()
    this.mantenimientoVehicularService.obtenerDetalleSolicitud(this.idRegistro).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta) => {
        if (respuesta.datos.length === 0) return;
        this.obtenerAsignacion(respuesta.datos[0]);
        this.obtenerVehiculo(respuesta.datos[0]);
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  obtenerAsignacion(respuesta: RespuestaAsignacion): void {
    this.vehiculoSeleccionado = {
      DESCRIPCION: "",
      DES_MARCA: respuesta.DES_MARCA,
      DES_MODALIDAD: "",
      DES_MODELO: respuesta.DES_MODELO,
      DES_MTTOESTADO: respuesta.DES_MTTOESTADO,
      DES_MTTO_TIPO: respuesta.DES_MTTO_TIPO,
      DES_NIVELOFICINA: "",
      DES_NUMMOTOR: respuesta.DES_NUMMOTOR,
      DES_NUMSERIE: respuesta.DES_NUMSERIE,
      DES_PLACAS: respuesta.DES_PLACAS,
      DES_SUBMARCA: "",
      DES_USO: "",
      ID_MTTOVEHICULAR: 0,
      ID_OFICINA: 0,
      ID_USOVEHICULO: 0,
      ID_VEHICULO: respuesta.ID_VEHICULO,
      ID_VELATORIO: 0,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      NOM_VELATORIO: respuesta.NOM_VELATORIO,
      TOTAL: 0
    }
  }

  obtenerVehiculo(respuesta: RespuestaAsignacion): void {
    this.asignacion = {
      fechaRegistro: respuesta.FEC_REGISTRO,
      kilometraje: "",
      mantenimientoPreventivo: respuesta.DES_MTTO_CORRECTIVO,
      modalidad: respuesta.DES_MODALIDAD,
      notas: "",
      tipoMantenimiento: respuesta.DES_MTTO_TIPO
    }
  }

}
