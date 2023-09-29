import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';

import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { EntradaVehiculo } from "../../models/registro-vehiculo.interface";
import { ControlVehiculoConsulta, ControlVehiculoListado } from '../../models/control-vehiculos.interface';
import { mensajes } from '../../../reservar-salas/constants/mensajes';

@Component({
  selector: 'app-registrar-entrada',
  templateUrl: './registrar-entrada.component.html',
  styleUrls: ['./registrar-entrada.component.scss']
})
export class RegistrarEntradaComponent implements OnInit {

  formRegistrarEntrada!: FormGroup;
  datosVehiculo: ControlVehiculoConsulta = {
    marca: '',
    nombreDestino: '',
    idVehiculo: '',
    nombreFinado: '',
    nombreContratante: '',
    folioODS: '',
    tarjetaCirculacion: '',
    modelo: '',
    placas: '',
    disponible: 0,
    idODS: 0,
    idDisponibilidad: 0,
  };
  vehiculoSeleccionado: ControlVehiculoListado = {
    idVehiculo: 0,
    disponible: 0,
    descripcion: ''
  };

  indice: number = 0;
  idOds!: any;
  tipoSala: number = 0;
  folioValido: boolean = false;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly loaderService: LoaderService,
    private controlVehiculosService: ControlVehiculosService
  ) { }

  ngOnInit(): void {
    this.vehiculoSeleccionado = this.config.data.vehiculo;
    this.iniciarFormRegistrarEntrada();
    this.obtenerDatosVehiculo();
  }

  iniciarFormRegistrarEntrada(): void {
    this.formRegistrarEntrada = this.formBuilder.group({
      fecha: new FormControl({ value: (new Date()), disabled: true }, []),
      hora: new FormControl({ value: moment().format('HH:mm'), disabled: true }, []),
      nivelGasolina: new FormControl({ value: null, disabled: false }, [Validators.required]),
      kilometrajeFinal: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  obtenerDatosVehiculo() {
    if (this.vehiculoSeleccionado.idVehiculo) {
      this.controlVehiculosService.obtenerDatosVehiculo(this.vehiculoSeleccionado.idVehiculo).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos.length > 0) {
            this.datosVehiculo = respuesta.datos[respuesta.datos.length - 1];
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        }
      });
    }
  }

  consultaODS(): void {
    this.loaderService.activar();
    const folioODS = +this.f.folioODS.value;
    if (!folioODS) {
      this.loaderService.desactivar();
      return;
    }
    this.controlVehiculosService.consultarODS(folioODS).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos) {
          this.folioValido = true;
          this.idOds = respuesta.datos[0]?.idODS;
          this.f.nombreContratante.setValue(respuesta.datos[0]?.nombreContratante);
          this.f.nombreFinado.setValue(respuesta.datos[0]?.nombreFinado);
        } else {
          this.folioValido = false;
          this.f.nombreContratante.patchValue(null);
          this.f.nombreFinado.patchValue(null);
          this.alertaService.mostrar(TipoAlerta.Precaucion, "El número de folio no existe.\n" +
            "Verifica tu información.\n")
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  guardar(): void {
    if (this.indice === 0) {
      this.indice++;
      return;
    }
    this.loaderService.activar();
    this.controlVehiculosService.guardarEntrada(this.datosGuardar()).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        const nuevoMensaje = `${mensaje[0]?.desMensaje} ${this.datosVehiculo.placas} - ${this.datosVehiculo.marca} ${this.datosVehiculo.modelo}`;
        this.alertaService.mostrar(TipoAlerta.Exito, nuevoMensaje);
        this.ref.close(true);
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
      }
    });
  }

  datosGuardar(): EntradaVehiculo {
    return {
      idVehiculo: this.vehiculoSeleccionado.idVehiculo,
      idODS: +this.datosVehiculo.idODS,
      fecEntrada: moment(this.f.fecha.value).format('yyyy-MM-DD'),
      horaEntrada: this.f.hora.value,
      gasolinaFinal: this.f.nivelGasolina.value,
      kmFinal: +this.f.kilometrajeFinal.value,
      idDispVehiculo: +this.datosVehiculo.idDisponibilidad,
    }
  }

  quitarEspacios(cadena: string) {
    return cadena.replace(/\s{2,}/g, ' ').trim();
  }

  noEspaciosAlPrincipio() {
    this.f.nombreResponsable.setValue(
      this.f.nombreResponsable.value.trimStart());
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    this.ref.close()
  }

  get f() {
    return this.formRegistrarEntrada.controls;
  }
}
