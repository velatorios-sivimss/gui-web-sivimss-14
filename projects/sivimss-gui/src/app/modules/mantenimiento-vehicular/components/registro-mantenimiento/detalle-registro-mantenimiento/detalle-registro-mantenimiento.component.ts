import {Component, OnInit} from '@angular/core';
import {obtenerFechaActual} from "../../../../../utils/funciones-fechas";
import {VehiculoMantenimiento} from "../../../models/vehiculoMantenimiento.interface";
import {ResumenRegistro} from "../../../models/resumenRegistro.interface";
import {ActivatedRoute} from "@angular/router";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {RespuestaRegistroMantenimiento} from "../../../models/respuestaRegistroMantenimiento.interface";

type VehiculoDetalle = Omit<VehiculoMantenimiento, "ID_MTTO_REGISTRO" | "ID_MTTO_SOLICITUD" | "ID_MTTOVERIFINICIO">

@Component({
  selector: 'app-detalle-registro-mantenimiento',
  templateUrl: './detalle-registro-mantenimiento.component.html',
  styleUrls: ['./detalle-registro-mantenimiento.component.scss']
})
export class DetalleRegistroMantenimientoComponent implements OnInit {

  fecha: string = obtenerFechaActual();
  vehiculoSeleccionado!: VehiculoDetalle;
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
    this.validarRegistro();
  }

  validarRegistro(): void {
    if (!this.idRegistro) return;
    this.cargadorService.activar();
    this.mantenimientoVehicularService.obtenerDetalleRegistro(this.idRegistro).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) return;
        this.llenarInformacionRegistro(respuesta.datos[0]);
        this.llenarInformacionVehiculo(respuesta.datos[0]);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  llenarInformacionVehiculo(respuesta: RespuestaRegistroMantenimiento): void {
    this.vehiculoSeleccionado = {
      DESCRIPCION: "",
      DES_MARCA: respuesta.DES_MARCA,
      DES_MODALIDAD: respuesta.DES_MODALIDAD,
      DES_MODELO: respuesta.DES_MODELO,
      DES_MTTOESTADO: respuesta.DES_MTTOESTADO,
      DES_MTTO_TIPO: "",
      DES_NIVELOFICINA: respuesta.DES_DELEGACION,
      DES_NUMMOTOR: respuesta.DES_NUMMOTOR,
      DES_NUMSERIE: respuesta.DES_NUMSERIE,
      DES_PLACAS: respuesta.DES_PLACAS,
      DES_SUBMARCA: respuesta.DES_SUBMARCA,
      DES_USO: respuesta.DES_USO,
      ID_MTTOVEHICULAR: 0,
      ID_OFICINA: 0,
      ID_USOVEHICULO: 0,
      ID_VEHICULO: respuesta.ID_VEHICULO,
      ID_VELATORIO: 0,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      NOM_VELATORIO: respuesta.NOM_VELATORIO,
      TOTAL: 0,
      verificacionDia: "",
      DES_DELEGACION: respuesta.DES_DELEGACION
    }
  }

  llenarInformacionRegistro(respuesta: RespuestaRegistroMantenimiento): void {
    this.registro = {
      costo: respuesta.COSTO_MTTO,
      fechaMantenimiento: "",
      kilometraje: respuesta.KILOMETRAJE,
      matPreventivo: "",
      modalidad: respuesta.DES_MODALIDAD,
      nombreProveedor: respuesta.NOM_PROVEEDOR,
      notas: respuesta.DES_NOTAS,
      numeroContrato: respuesta.DES_NUMCONTRATO,
      taller: respuesta.DES_NOMBRE_TALLER,
      tipoMantenimiento: ""
    }
  }
}
