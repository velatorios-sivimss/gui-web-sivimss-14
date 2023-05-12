import {Component, OnInit} from '@angular/core';
import {tablaRin} from "../../../constants/tabla-rines";
import {ActivatedRoute} from "@angular/router";
import {VerificacionInicio} from "../../../models/verificacionInicio.interface";
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {finalize} from "rxjs/operators";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {VehiculoMantenimiento} from "../../../models/vehiculoMantenimiento.interface";
import {RespuestaVerificacion} from "../../../models/respuestaVerificacion.interface";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-detalle-nueva-verificacion',
  templateUrl: './detalle-nueva-verificacion.component.html',
  styleUrls: ['./detalle-nueva-verificacion.component.scss']
})
export class DetalleNuevaVerificacionComponent implements OnInit {

  data = tablaRin;
  vehiculoSeleccionado!: VehiculoMantenimiento;
  verificacion!: VerificacionInicio;
  fecha: string = obtenerFechaActual();
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
          this.verificacion = JSON.parse(params.solicitud);
        }
      }
    );
  }

  ngOnInit(): void {
    this.validarVerificacion();
  }

  validarVerificacion(): void {
    if (!this.idRegistro) return;
    this.cargadorService.activar()
    this.mantenimientoVehicularService.obtenerDetalleVerificacion(this.idRegistro).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) return;
        this.llenarInformacionVehiculo(respuesta.datos[0]);
        this.llenarInformacionVerificacion(respuesta.datos[0]);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message)
      }
    });
  }

  llenarInformacionVehiculo(respuesta: RespuestaVerificacion): void {
    this.vehiculoSeleccionado = {
      verificacionDia: 'false',
      DESCRIPCION: "",
      DES_MARCA: respuesta.DES_MARCA,
      DES_MODALIDAD: "",
      DES_MODELO: respuesta.DES_MODELO,
      DES_MTTOESTADO: respuesta.DES_MTTOESTADO,
      DES_MTTO_TIPO: "",
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

  llenarInformacionVerificacion(respuesta: RespuestaVerificacion): void {
    this.verificacion = {
      idCalNeuDelanteros: respuesta.DES_NIVEL_NEUMADELA,
      idCalNeuTraseros: respuesta.DES_NIVEL_NEUMATRASE,
      idCodigoFallo: respuesta.DES_NIVEL_CODIGOFALLO,
      idLimpiezaExterior: respuesta.DES_NIVEL_LIMPIEZAEXTERIOR,
      idLimpiezaInterior: respuesta.DES_NIVEL_LIMPIEZAINTERIOR,
      idMttoVehicular: respuesta.ID_MTTOVEHICULAR,
      idMttoVerifInicio: respuesta.ID_MTTOVERIFINICIO,
      idNivelAceite: respuesta.DES_NIVEL_ACEITE,
      idNivelAgua: respuesta.DES_NIVEL_AGUA,
      idNivelBateria: respuesta.DES_NIVEL_BATERIA,
      idNivelCombustible: respuesta.DES_NIVEL_COMBUSTIBLE
    }
  }

}
