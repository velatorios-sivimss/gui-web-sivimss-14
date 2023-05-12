import {Component, OnInit} from '@angular/core';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {ResumenAsignacion} from "../../../models/resumenAsignacion.interface";
import {ActivatedRoute} from "@angular/router";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {finalize} from "rxjs/operators";
import {RespuestaSolicitudMantenimiento} from "../../../models/respuestaSolicitudMantenimiento.interface";
import {VehiculoMantenimiento} from "../../../models/vehiculoMantenimiento.interface";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-detalle-solicitud-mantenimiento',
  templateUrl: './detalle-solicitud-mantenimiento.component.html',
  styleUrls: ['./detalle-solicitud-mantenimiento.component.scss']
})
export class DetalleSolicitudMantenimientoComponent implements OnInit {

  fecha: string = obtenerFechaActual();
  vehiculoSeleccionado!: VehiculoMantenimiento;
  asignacion!: ResumenAsignacion;
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
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) return;
        this.llenarInformacionVehiculo(respuesta.datos[0]);
        this.llenarInformacionSolicitud(respuesta.datos[0]);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    })
  }

  llenarInformacionVehiculo(respuesta: RespuestaSolicitudMantenimiento): void {
    this.vehiculoSeleccionado = {
      verificacionDia: 'false',
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
      DES_SUBMARCA: respuesta.DES_SUBMARCA,
      DES_USO: "",
      ID_MTTOVEHICULAR: 0,
      ID_OFICINA: 0,
      ID_USOVEHICULO: 0,
      ID_VEHICULO: respuesta.ID_VEHICULO,
      ID_VELATORIO: 0,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      NOM_VELATORIO: respuesta.NOM_VELATORIO,
      TOTAL: 0,
      DES_DELEGACION: respuesta.DES_DELEGACION
    }
  }

  llenarInformacionSolicitud(respuesta: RespuestaSolicitudMantenimiento): void {
    this.asignacion = {
      fechaRegistro: respuesta.FEC_REGISTRO,
      kilometraje: respuesta.KILOMETRAJE,
      mantenimientoPreventivo: respuesta.DES_MTTO_CORRECTIVO,
      modalidad: respuesta.DES_MODALIDAD,
      notas: respuesta.DES_NOTAS,
      tipoMantenimiento: respuesta.DES_MTTO_TIPO
    }
  }

}
