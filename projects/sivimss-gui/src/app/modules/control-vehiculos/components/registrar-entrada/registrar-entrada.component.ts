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
import { SalaVelatorio } from "../../models/sala-velatorio.interface";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { EntradaVehiculo } from "../../models/registro-vehiculo.interface";

@Component({
  selector: 'app-registrar-entrada',
  templateUrl: './registrar-entrada.component.html',
  styleUrls: ['./registrar-entrada.component.scss']
})
export class RegistrarEntradaComponent implements OnInit {

  registroEntradaForm!: FormGroup;
  salaSeleccionada: SalaVelatorio = {};

  indice: number = 0;
  idOds!: any;
  tipoSala: number = 0;
  folioValido: boolean = false;
  opcionesInicio: TipoDropdown[] = [{ label: 'Mantenimiento', value: '1' }, { label: 'Servicio de ODS', value: '2' }];
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);


  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly loaderService: LoaderService,
    private controlVehiculosService: ControlVehiculosService
  ) {
    this.iniciarFormRegistroEntrada();
  }

  iniciarFormRegistroEntrada(): void {
    this.registroEntradaForm = this.formBuilder.group({
      inicioDe: [{ value: null, disabled: false }, [Validators.required]],
      descripcionMantenimiento: [{ value: null, disabled: false }],
      folioODS: [{ value: null, disabled: false }, [Validators.required]],
      nombreContratante: [{ value: null, disabled: true }, [Validators.required]],
      nombreFinado: [{ value: null, disabled: true }, [Validators.required]],
      nombreResponsable: [{ value: null, disabled: false }, [Validators.required]],
      nivelGas: [{ value: null, disabled: false }, [Validators.required]],
      fecha: [{ value: null, disabled: false }, [Validators.required]],
      hora: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.salaSeleccionada = this.config.data.sala;
    this.tipoSala = this.config.data.tipoSala;
    this.confFormTipoSala(this.tipoSala);
  }

  consultaODS(): void {
    this.loaderService.activar();
    const folioODS = +this.entradaF.folioODS.value;
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
          this.entradaF.nombreContratante.setValue(respuesta.datos[0]?.nombreContratante);
          this.entradaF.nombreFinado.setValue(respuesta.datos[0]?.nombreFinado);
        } else {
          this.folioValido = false;
          this.entradaF.nombreContratante.patchValue(null);
          this.entradaF.nombreFinado.patchValue(null);
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
      this.entradaF.descripcionMantenimiento.disabled;
      this.entradaF.descripcionMantenimiento.clearValidators();
      this.entradaF.descripcionMantenimiento.setValue("");

      this.entradaF.folioODS.enabled;
      this.entradaF.folioODS.setValidators([Validators.required]);
      this.entradaF.nombreContratante.enabled;
      this.entradaF.nombreContratante.setValidators([Validators.required]);
      this.entradaF.nombreFinado.enabled;
      this.entradaF.nombreFinado.setValidators([Validators.required]);
      this.entradaF.nivelGas.enabled;
      this.entradaF.nivelGas.setValidators([Validators.required]);
      this.folioValido = false;
    } else {
      this.entradaF.descripcionMantenimiento.enabled;
      this.entradaF.descripcionMantenimiento.setValidators([Validators.required]);

      this.entradaF.folioODS.disabled;
      this.entradaF.folioODS.clearValidators();
      this.entradaF.folioODS.setValue("");

      this.entradaF.nombreContratante.disabled;
      this.entradaF.nombreContratante.clearValidators();
      this.entradaF.nombreContratante.setValue("");

      this.entradaF.nombreFinado.disabled;
      this.entradaF.nombreFinado.clearValidators();
      this.entradaF.nombreFinado.setValue("");

      this.entradaF.nivelGas.disabled;
      this.entradaF.nivelGas.clearValidators();
      this.entradaF.nivelGas.setValue("");

      this.folioValido = true;
    }
  }

  guardar(): void {
    if (this.indice === 0) {
      this.indice++;
      return;
    }
    this.loaderService.activar();
    this.controlVehiculosService.guardar(this.datosGuardar()).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.ref.close(true);
        const alertas = JSON.parse(localStorage.getItem('mensajes') as string);
        const mensaje = alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
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
      idSala: this.salaSeleccionada.idSala,
      idOds: this.idOds ? this.idOds : null,
      idTipoOcupacion: +this.entradaF.inicioDe.value,
      fechaEntrada: moment(this.entradaF.fecha.value).format('yyyy/MM/DD'),
      horaEntrada: moment(this.entradaF.hora.value).format('HH:mm'),
      cantidadGasInicial: this.entradaF.nivelGas.value,
      nombreResponsable: this.quitarEspacios(this.entradaF.nombreResponsable.value),
      descripcionMantenimiento: this.quitarEspacios(this.entradaF.descripcionMantenimiento.value),
    }
  }

  quitarEspacios(cadena: string) {
    return cadena.replace(/\s{2,}/g, ' ').trim();
  }

  confFormTipoSala(sala: number): void {
    if (sala) {
      this.entradaF.nivelGas.disabled;
      this.entradaF.nivelGas.clearValidators();
      this.entradaF.nivelGas.setValue("");
    }
  }

  noEspaciosAlPrincipio() {
    this.entradaF.nombreResponsable.setValue(
      this.entradaF.nombreResponsable.value.trimStart());
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    this.ref.close()
  }

  get entradaF() {
    return this.registroEntradaForm.controls;
  }
}
