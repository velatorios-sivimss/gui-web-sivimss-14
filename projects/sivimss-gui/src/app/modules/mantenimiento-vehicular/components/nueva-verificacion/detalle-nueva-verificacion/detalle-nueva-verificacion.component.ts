import {Component, OnInit} from '@angular/core';
import {tablaRin} from "../../../constants/tabla-rines";
import {ActivatedRoute} from "@angular/router";
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {VerificacionInicio} from "../../../models/verificacion-inicio.interface";
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {finalize} from "rxjs/operators";

interface RespuestaVerificacion {
  DES_DELEGACION: "AGUASCALIENTES"
  DES_MARCA: "NIssan"
  DES_MODELO: "2029"
  DES_MTTOESTADO: "En tiempo"
  DES_NIVEL_ACEITE: "Correcto"
  DES_NIVEL_AGUA: "Medio"
  DES_NIVEL_BATERIA: "Bajo"
  DES_NIVEL_CODIGOFALLO: "Bajo"
  DES_NIVEL_COMBUSTIBLE: "Bajo"
  DES_NIVEL_LIMPIEZAEXTERIOR: "Bajo"
  DES_NIVEL_LIMPIEZAINTERIOR: "Bajo"
  DES_NIVEL_NEUMADELA: "Bajo"
  DES_NIVEL_NEUMATRASE: "Bajo"
  DES_NUMMOTOR: "Test1"
  DES_NUMSERIE: "675765"
  DES_PLACAS: "T77NBH"
  DES_USO: "Utilitario administrativo"
  FEC_ALTA: "2023-04-26T18:36:22.000+00:00"
  ID_CALNEUDELANTEROS: 1
  ID_CALNEUTRASEROS: 1
  ID_CODIGOFALLO: 1
  ID_DELEGACION: 1
  ID_LIMPIEZAEXTERIOR: 1
  ID_LIMPIEZAINTERIOR: 1
  ID_MTTOESTADO: 1
  ID_MTTOVEHICULAR: 20
  ID_MTTOVERIFINICIO: 4
  ID_NIVELACEITE: 10
  ID_NIVELAGUA: 5
  ID_NIVELBATERIA: 1
  ID_NIVELCOMBUSTIBLE: 1
  ID_VEHICULO: 1
  ID_VELATORIO: 1
  IND_ACTIVO: true
  IND_ESTATUS: false
  NOM_VELATORIO: "DOCTORES"
}

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
      next: (respuesta) => {
        if (respuesta.datos.length === 0) return;
        this.obtenerVerificacion(respuesta.datos[0]);
        this.obtenerVehiculo(respuesta.datos[0]);
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  obtenerVerificacion(respuesta: RespuestaVerificacion): void {
    this.vehiculoSeleccionado = {
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

  obtenerVehiculo(respuesta: RespuestaVerificacion): void {
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
