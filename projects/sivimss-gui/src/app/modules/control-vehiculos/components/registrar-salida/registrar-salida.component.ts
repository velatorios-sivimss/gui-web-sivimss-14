import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { finalize } from "rxjs/operators";
import * as moment from 'moment';

import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { SalaVelatorio } from "../../models/sala-velatorio.interface";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { SalidaVehiculo } from "../../models/registro-vehiculo.interface";
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-registrar-salida',
  templateUrl: './registrar-salida.component.html',
  styleUrls: ['./registrar-salida.component.scss']
})
export class RegistrarSalidaComponent implements OnInit {

  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  registroSalidaForm!: FormGroup;

  indice: number = 0;
  tipoSala: number = 0;
  estadoSala: string = "";

  salaSeleccionada: SalaVelatorio = {};

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private controlVehiculosService: ControlVehiculosService
  ) { }

  ngOnInit(): void {
    this.salaSeleccionada = this.config.data.sala;
    this.estadoSala = this.config.data.sala.estadoSala;
    this.tipoSala = this.config.data.tipoSala;
    this.inicializarFormRegistroSalida();
    this.confFormTipoSala(this.tipoSala);
  }

  inicializarFormRegistroSalida(): void {
    this.registroSalidaForm = this.formBuilder.group({
      nivelGas: [{ value: null, disabled: false }, [Validators.required]],
      fecha: [{ value: null, disabled: false }, [Validators.required]],
      hora: [{ value: null, disabled: false }, [Validators.required]],
    })
  }

  confFormTipoSala(sala: number): void {
    if (sala || this.estadoSala === "MANTENIMIENTO") {
      this.salidaF.nivelGas.disabled;
      this.salidaF.nivelGas.clearValidators();
      this.salidaF.nivelGas.setValue("");
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
    return this.registroSalidaForm.controls;
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
        console.error("ERROR: ", error.message);
      }
    );

  }

  datosGuardar(): SalidaVehiculo {
    if (this.estadoSala == "MANTENIMIENTO" || this.tipoSala) {
      return {
        idSala: this.salaSeleccionada.idSala,
        fechaSalida: moment(this.salidaF.fecha.value).format('yyyy/MM/DD'),
        horaSalida: moment(this.salidaF.hora.value).format('HH:mm'),
        // cantidadGasFinal: this.salidaF.nivelGas.value,
        idRegistro: this.salaSeleccionada.idRegistro
      }
    }
    return {
      idSala: this.salaSeleccionada.idSala,
      fechaSalida: moment(this.salidaF.fecha.value).format('yyyy/MM/DD'),
      horaSalida: moment(this.salidaF.hora.value).format('HH:mm'),
      cantidadGasFinal: this.salidaF.nivelGas.value,
      idRegistro: this.salaSeleccionada.idRegistro
    }
  }
}
