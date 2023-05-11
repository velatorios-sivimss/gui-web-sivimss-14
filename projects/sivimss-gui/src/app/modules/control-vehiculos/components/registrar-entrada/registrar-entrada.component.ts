import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';

import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
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
    disponibilidad: 0,
    idODS: 0,
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
      nivelGasolina: [{ value: null, disabled: false }, [Validators.required]],
      kilometrajeFinal: [{ value: null, disabled: false }, [Validators.required]],
    });
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

  consultaODS(): void {
    this.loaderService.activar();
    const folioODS = +this.f.folioODS.value;
    if (!folioODS) {
      this.loaderService.desactivar();
      return;
    }
    this.controlVehiculosService.consultarODS(folioODS).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
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
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  cambioInicioDe(event: any): void {
    if (event.value == 2) {
      this.f.descripcionMantenimiento.disabled;
      this.f.descripcionMantenimiento.clearValidators();
      this.f.descripcionMantenimiento.setValue("");

      this.f.folioODS.enabled;
      this.f.folioODS.setValidators([Validators.required]);
      this.f.nombreContratante.enabled;
      this.f.nombreContratante.setValidators([Validators.required]);
      this.f.nombreFinado.enabled;
      this.f.nombreFinado.setValidators([Validators.required]);
      this.f.nivelGas.enabled;
      this.f.nivelGas.setValidators([Validators.required]);
      this.folioValido = false;
    } else {
      this.f.descripcionMantenimiento.enabled;
      this.f.descripcionMantenimiento.setValidators([Validators.required]);

      this.f.folioODS.disabled;
      this.f.folioODS.clearValidators();
      this.f.folioODS.setValue("");

      this.f.nombreContratante.disabled;
      this.f.nombreContratante.clearValidators();
      this.f.nombreContratante.setValue("");

      this.f.nombreFinado.disabled;
      this.f.nombreFinado.clearValidators();
      this.f.nombreFinado.setValue("");

      this.f.nivelGas.disabled;
      this.f.nivelGas.clearValidators();
      this.f.nivelGas.setValue("");

      this.folioValido = true;
    }
  }

  guardar(): void {
    if (this.indice === 0) {
      this.indice++;
      return;
    }
    this.loaderService.activar();
    this.controlVehiculosService.guardarEntrada(this.datosGuardar()).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        this.ref.close(true);
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
      }
    );
  }

  datosGuardar(): EntradaVehiculo {
    return {
      idVehiculo: this.vehiculoSeleccionado.idVehiculo,
      idODS: +this.datosVehiculo.idODS,
      fecEntrada: moment().format('yyyy/MM/DD'),
      horaEntrada: moment().format('HH:mm'),
      gasolinaFinal: this.f.nivelGasolina.value,
      kmFinal: +this.f.kilometrajeFinal.value,
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
