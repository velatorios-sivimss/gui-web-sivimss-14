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

@Component({
  selector: 'app-registrar-salida',
  templateUrl: './registrar-salida.component.html',
  styleUrls: ['./registrar-salida.component.scss']
})
export class RegistrarSalidaComponent implements OnInit {

  alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  formRegistrarSalida!: FormGroup;
  indice: number = 0;
  tipoSala: number = 0;
  estadoSala: string = "";
  formRegistrarEntrada!: FormGroup;
  catalogoResponsables: TipoDropdown[] = [];
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
    disponibilidad: 0,
    idODS: 0,
  };
  vehiculoSeleccionado: ControlVehiculoListado = {
    idVehiculo: 0,
    disponible: 0,
    descripcion: ''
  };

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
      folioOds: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreContratante: new FormControl({ value: null, disabled: true }, [Validators.required]),
      nombreFinado: new FormControl({ value: null, disabled: true }, [Validators.required]),
      nombreDestino: new FormControl({ value: null, disabled: true }, [Validators.required]),
      municipioOrigen: new FormControl({ value: null, disabled: false }, [Validators.required]),
      municipioDestino: new FormControl({ value: null, disabled: false }, [Validators.required]),
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
      ).subscribe(
        (respuesta: HttpRespuesta<any>) => {
          // TO DO mostrar mensaje 45 -  no hay datos
          if (respuesta.datos.length > 0) {
            this.datosVehiculo = respuesta.datos[0];
          }
          // if (respuesta.datos) {
          //   this.folioValido = true;
          //   this.idOds = respuesta.datos[0]?.idODS;
          //   this.f.nombreContratante.setValue(respuesta.datos[0]?.nombreContratante);
          //   this.f.nombreFinado.setValue(respuesta.datos[0]?.nombreFinado);
          // } else {
          //   this.folioValido = false;
          //   this.f.nombreContratante.patchValue(null);
          //   this.f.nombreFinado.patchValue(null);
          //   this.alertaService.mostrar(TipoAlerta.Precaucion, "El número de folio no existe.\n" +
          //     "Verifica tu información.\n")
          // }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
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
      this.indice++;
      return;
    }
    this.loaderService.activar();
    this.controlVehiculosService.actualizar(this.datosGuardar()).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        this.ref.close(true);
      },
      (error: HttpErrorResponse) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        console.error("ERROR: ", error);
      }
    );

  }

  datosGuardar(): SalidaVehiculo {
    if (this.estadoSala == "MANTENIMIENTO" || this.tipoSala) {
      return {
        idSala: this.vehiculoSeleccionado.idVehiculo,
        fechaSalida: moment(this.salidaF.fecha.value).format('yyyy/MM/DD'),
        horaSalida: moment(this.salidaF.hora.value).format('HH:mm'),
        idRegistro: this.vehiculoSeleccionado.idVehiculo
      }
    }
    return {
      idSala: this.vehiculoSeleccionado.idVehiculo,
      fechaSalida: moment(this.salidaF.fecha.value).format('yyyy/MM/DD'),
      horaSalida: moment(this.salidaF.hora.value).format('HH:mm'),
      cantidadGasFinal: this.salidaF.nivelGas.value,
      idRegistro: this.vehiculoSeleccionado.idVehiculo
    }
  }

  obtenerDatosFolioOds() {
    if (this.f.folioOds.valid) {
      this.controlVehiculosService.obtenerDatosFolioOds(this.f.folioOds.value).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos?.content.length > 0) {
            const { nombreContratante, nombreDestino, nombreFinado } = respuesta.datos?.content[0];
            this.f.nombreContratante.patchValue(nombreContratante);
            this.f.nombreFinado.patchValue(nombreFinado);
            this.f.nombreDestino.patchValue(nombreDestino);
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
    }
  }

  obtenerOperadores() {
    this.controlVehiculosService.obtenerOperadores(this.vehiculoSeleccionado.idVehiculo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        let newArray: TipoDropdown[] = [];
        if (respuesta.datos?.content.length > 0) {
          respuesta.datos?.content.forEach((item: any) => {
            newArray.push({
              value: item.nombreResponsable,
              label: item.nombreResponsable,
            })
          })
        }
        this.catalogoResponsables = newArray;
        // TO DO mostrar mensaje 45 -  no hay datos
        // if (respuesta.datos.length > 0) {
        //   this.datosVehiculo = respuesta.datos[0];
        // }
        // if (respuesta.datos) {
        //   this.folioValido = true;
        //   this.idOds = respuesta.datos[0]?.idODS;
        //   this.f.nombreContratante.setValue(respuesta.datos[0]?.nombreContratante);
        //   this.f.nombreFinado.setValue(respuesta.datos[0]?.nombreFinado);
        // } else {
        //   this.folioValido = false;
        //   this.f.nombreContratante.patchValue(null);
        //   this.f.nombreFinado.patchValue(null);
        //   this.alertaService.mostrar(TipoAlerta.Precaucion, "El número de folio no existe.\n" +
        //     "Verifica tu información.\n")
        // }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  get f() {
    return this.formRegistrarSalida.controls;
  }
}
