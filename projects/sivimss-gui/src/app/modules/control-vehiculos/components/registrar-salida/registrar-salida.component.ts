import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { finalize } from "rxjs/operators";
import * as moment from 'moment';

import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { ControlVehiculoConsulta, ControlVehiculoListado } from "../../models/control-vehiculos.interface";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { SalidaVehiculo } from "../../models/registro-vehiculo.interface";
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { mensajes } from '../../../reservar-salas/constants/mensajes';

@Component({
  selector: 'app-registrar-salida',
  templateUrl: './registrar-salida.component.html',
  styleUrls: ['./registrar-salida.component.scss']
})
export class RegistrarSalidaComponent implements OnInit {

  formRegistrarSalida!: FormGroup;
  indice: number = 0;
  tipoSala: number = 0;
  estadoSala: string = "";
  formRegistrarEntrada!: FormGroup;
  responsableSeleccionado: TipoDropdown[] = [];
  catalogoResponsables: TipoDropdown[] = [];
  fechaActual: Date = new Date();
  idOds: number = 0;
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
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private controlVehiculosService: ControlVehiculosService
  ) { }

  ngOnInit(): void {
    this.vehiculoSeleccionado = this.config.data.vehiculo;
    this.inicializarFormRegistrarSalida();
    this.obtenerDatosVehiculo();
    this.obtenerOperadores();
  }

  inicializarFormRegistrarSalida(): void {
    this.formRegistrarSalida = this.formBuilder.group({
      folioOds: new FormControl({ value: null, disabled: false }, []),
      nombreContratante: new FormControl({ value: null, disabled: true }, []),
      nombreFinado: new FormControl({ value: null, disabled: true }, []),
      municipioOrigen: new FormControl({ value: null, disabled: true }, []),
      municipioDestino: new FormControl({ value: null, disabled: true }, []),
      fecha: new FormControl({ value: (new Date()), disabled: false }, [Validators.required]),
      hora: new FormControl({ value: moment().format('HH:mm'), disabled: false }, [Validators.required]),
      nivelGasolinaInicial: new FormControl({ value: null, disabled: false }, [Validators.required]),
      kilometrajeInicial: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreResponsable: new FormControl({ value: null, disabled: false }, [Validators.required]),
    })
  }

  obtenerDatosVehiculo() {
    if (this.vehiculoSeleccionado.idVehiculo) {
      this.controlVehiculosService.obtenerDatosVehiculo(this.vehiculoSeleccionado.idVehiculo).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos.length > 0) {
            this.datosVehiculo = respuesta.datos[0];

            if (this.datosVehiculo.ods === 1) {
              this.f.folioOds.setValidators(Validators.required);
            } else {
              this.f.folioOds.clearValidators();
              this.f.folioOds.disable();
            }
            this.f.folioOds.updateValueAndValidity();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    this.ref.close()
  }

  get salidaF() {
    return this.formRegistrarSalida.controls;
  }

  guardar(): void {
    if (this.indice === 0) {
      this.handleChangeRespondable();
      this.indice++;
      return;
    }
    this.loaderService.activar();
    this.controlVehiculosService.guardarSalida(this.datosGuardar()).pipe(
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
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje);
        console.error("ERROR: ", error);
      }
    });
  }

  datosGuardar(): SalidaVehiculo {
    return {
      idVehiculo: +this.vehiculoSeleccionado.idVehiculo,
      idODS: this.idOds,
      fecSalida: moment(this.f.fecha.value).format('yyyy-MM-DD'),
      horaSalida: this.f.hora.value,
      gasolinaInicial: this.f.nivelGasolinaInicial.value,
      kmInicial: +this.f.kilometrajeInicial.value,
      idResponsable: +this.f.nombreResponsable.value,
    }
  }

  obtenerDatosFolioOds() {
    if (this.f.folioOds.valid) {
      this.controlVehiculosService.obtenerDatosFolioOds(this.f.folioOds.value).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos?.content.length > 0) {
            const { idOds, nombreContratante, nombreDestino, nombreFinado, nombreOrigen } = respuesta.datos?.content[0] || [];
            this.f.nombreContratante.patchValue(nombreContratante);
            this.f.nombreFinado.patchValue(nombreFinado);
            this.f.municipioOrigen.patchValue(nombreOrigen);
            this.f.municipioDestino.patchValue(nombreDestino);
            this.f.folioOds.setErrors(null);
            this.idOds = +idOds;
          } else {
            const mensaje = this.alertas?.filter((msj: any) => {
              return msj.idMensaje == respuesta.mensaje;
            })
            this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
            this.f.nombreContratante.patchValue(null);
            this.f.nombreFinado.patchValue(null);
            this.f.municipioOrigen.patchValue(null);
            this.f.municipioDestino.patchValue(null);
            this.f.folioOds.setErrors({ 'incorrect': true });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  obtenerOperadores() {
    this.controlVehiculosService.obtenerOperadores(this.vehiculoSeleccionado.idVehiculo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let newArray: TipoDropdown[] = [];
        if (respuesta.datos?.content.length > 0) {
          respuesta.datos?.content.forEach((item: any) => {
            newArray.push({
              value: item.idResponsable,
              label: item.nombreResponsable,
            })
          })
        }
        this.catalogoResponsables = newArray;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  handleChangeRespondable() {
    this.responsableSeleccionado =
      this.catalogoResponsables.filter((item: TipoDropdown) => item.value === this.f.nombreResponsable.value);
  }

  get f() {
    return this.formRegistrarSalida.controls;
  }
}
