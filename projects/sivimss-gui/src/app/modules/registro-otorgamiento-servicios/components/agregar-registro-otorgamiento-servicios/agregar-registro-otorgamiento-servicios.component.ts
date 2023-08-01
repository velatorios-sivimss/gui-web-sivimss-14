import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OtorgamientoServicios } from '../../models/otorgamiento-servicios-interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { RegistroOtorgamientoServiciosService } from '../../services/registro-otorgamiento-servicios.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { finalize } from 'rxjs';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-agregar-registro-otorgamiento-servicios',
  templateUrl: './agregar-registro-otorgamiento-servicios.component.html',
  styleUrls: ['./agregar-registro-otorgamiento-servicios.component.scss'],
})
export class AgregarRegistroOtorgamientoServiciosComponent implements OnInit {
  form!: FormGroup;

  registro = Date.now();
  fechaActual: string = '';
  confirmacionAgregar: boolean = false;

  registroOtorgamiento: OtorgamientoServicios = {};
  idODS: number = 0;
  listaServicios: any[] = [];
  constructor(
    public ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private servicioOtorgamiento: RegistroOtorgamientoServiciosService
  ) {}

  ngOnInit(): void {
    this.idODS = this.config.data.idODS;
    this.fechaActual = moment(new Date()).format('DD/MM/YYYY');
    this.inicializarForm();
    this.buscarTiposServicios(this.config.data.idODS);
  }

  inicializarForm() {
    this.form = this.formBuilder.group({
      idOrdenServicio: [{ value: null }],
      servicio: [{ value: null }],
      fecha: [{ value: null }],
      fechaMostrar: [{ value: null }],
      idTipoServicio: [{ value: null, disabled: false }, [Validators.required]],
      indCertificado: [{ value: null, disabled: false }],
      desNotas: [{ value: null, disabled: false }],
    });
  }

  buscarTiposServicios(idODS: number) {
    this.servicioOtorgamiento.consultarTiposServicios(idODS).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const datos = respuesta.datos;
        if (respuesta.error) {
          this.listaServicios = [];
          this.alertaService.mostrar(
            TipoAlerta.Error,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              Number(respuesta.datos)
            )
          );
          return;
        }
        this.listaServicios = mapearArregloTipoDropdown(
          datos,
          'nombreServicio',
          'idTipoServicio'
        );
      },
      error: (error: HttpErrorResponse) => {
        try {
          console.error(error);
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(error.error.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Info,
            errorMsg || 'El servicio no responde, no permite más llamadas.'
          );
        } catch (error) {
          console.error(error);
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
          this.alertaService.mostrar(
            TipoAlerta.Info,
            errorMsg || 'El servicio no responde, no permite más llamadas.'
          );
        }
      },
    });
  }

  confirmarAgregarOrderServicio(): void {
    this.confirmacionAgregar = true;
    this.registroOtorgamiento = {
      ...this.form.value,
    };
  }

  regresarPantalla(respuesta: boolean): void {
    this.confirmacionAgregar = !respuesta;
  }

  seleccionarServicio(dd: Dropdown) {
    this.f.servicio.setValue(dd.selectedOption.label);
    this.f.idOrdenServicio.setValue(this.idODS);
    let fechaMostrar = moment(new Date()).format('DD/MM/YYYY hh:mm:ss A');
    this.f.fechaMostrar.setValue(fechaMostrar);
    this.f.fecha.setValue(moment(new Date()).format('YYYY-MM-DD hh:mm:ss'));
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.form.controls;
  }
}
