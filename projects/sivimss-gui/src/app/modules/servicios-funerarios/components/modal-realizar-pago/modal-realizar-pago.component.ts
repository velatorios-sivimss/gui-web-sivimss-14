import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoDropdown } from '../../../../models/tipo-dropdown';

import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Dropdown } from 'primeng/dropdown';
import { DetallePagoService } from '../../services/detalle-pago.service';
import { RegistrarPago } from '../../models/registrar-pago.interface';
import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service';
import { MensajesSistemaService } from '../../../../services/mensajes-sistema.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modal-realizar-pago',
  templateUrl: './modal-realizar-pago.component.html',
  styleUrls: ['./modal-realizar-pago.component.scss'],
})
export class ModalRealizarPagoComponent implements OnInit {
  generarPagoForm!: FormGroup;
  idMetodoPago!: TipoDropdown[];
  fechaActual = new Date();
  mensualidades: number = 0;
  tipoDePago: string = '';
  confirmacionGuardar: boolean = false;
  errorMsg =
    ' Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  validacion: any = {
    nombreBanco: false,
    numeroAutorizacion: false,
    importe: false,
    totalPagar: false,
    folioAutorizacion: false,
    fecha: false,
    fechaVale: false,
    valeParitaria: false,
    importeValeParitaria: false,
  };

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private detallePagoService: DetallePagoService,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.inicializarDatos();
  }

  inicializarFormulario(): void {
    this.generarPagoForm = this.formBuilder.group({
      numeroAutorizacion: [{ value: null, disabled: false }],
      nombreBanco: [{ value: null, disabled: false }],
      importe: [{ value: null, disabled: false }],
      folioAutorizacion: [{ value: null, disabled: false }],
      fecha: [{ value: null, disabled: false }],
      fechaPago: [{ value: null, disabled: false }],
      totalPagar: [{ value: null, disabled: false }],
      idMetodoPago: [{ value: null, disabled: false }],
      idPlan: [{ value: null, disabled: false }],
      idPagoSFPA: [{ value: null, disabled: false }],
      valeParitaria: [{ value: null, disabled: false }],
      fechaVale: [{ value: null, disabled: false }],
      fechaValeParitaria: [{ value: null, disabled: false }],
      importeValeParitaria: [{ value: null, disabled: false }],
    });
  }

  inicializarDatos(): void {
    this.idMetodoPago = this.config.data.metodosPago;
    this.mensualidades = this.config.data.item.noPagos;
    this.formulario.idPlan.setValue(this.config.data.item.idPlanSFPA);
    this.formulario.idPagoSFPA.setValue(this.config.data.item.idPagoSFPA);
  }

  cambioMetodoPago(dd: Dropdown): void {
    this.formulario.numeroAutorizacion.patchValue(null);
    this.formulario.nombreBanco.patchValue(null);
    this.formulario.importe.patchValue(null);
    this.formulario.folioAutorizacion.patchValue(null);
    this.formulario.fechaPago.patchValue(null);
    this.formulario.totalPagar.patchValue(null);
    this.formulario.fecha.patchValue(null);
    this.formulario.valeParitaria.patchValue(null);
    this.formulario.fechaVale.patchValue(null);
    this.formulario.fechaValeParitaria.patchValue(null);
    this.formulario.importeValeParitaria.patchValue(null);

    this.tipoDePago = dd.selectedOption.label;
    if (this.tipoDePago.toUpperCase().includes('TARJETA CRÉDITO')) {
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
      this.validacion.fechaVale = false;
      this.validacion.valeParitaria = false;
      this.validacion.importeValeParitaria = false;
    }
    if (this.tipoDePago.toUpperCase().includes('TARJETA DÉBITO')) {
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
      this.validacion.fechaVale = false;
      this.validacion.valeParitaria = false;
      this.validacion.importeValeParitaria = false;
    }
    if (this.tipoDePago.toUpperCase().includes('TRANSFERENCIA')) {
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
      this.validacion.fechaVale = false;
      this.validacion.valeParitaria = false;
      this.validacion.importeValeParitaria = false;
    }
    if (this.tipoDePago.toUpperCase().includes('DEPÓSITO')) {
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
      this.validacion.fechaVale = false;
      this.validacion.valeParitaria = false;
      this.validacion.importeValeParitaria = false;
    }
    if (this.tipoDePago.toUpperCase().includes('VALE PARITARIA')) {
      this.validacion.fechaVale = true;
      this.validacion.valeParitaria = true;
      this.validacion.importeValeParitaria = true;
      this.validacion.nombreBanco = false;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = false;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
    }
  }

  cerrarModal() {
    this.ref.close(false);
  }

  guardarPago(): void {
    this.formulario.fechaPago.setValue(
      this.formulario.fecha.value
        ? moment(this.formulario.fecha.value).format('YYYY-MM-DD')
        : null
    );
    this.formulario.fechaValeParitaria.setValue(
      this.formulario.fechaVale.value
        ? moment(this.formulario.fechaVale.value).format('YYYY-MM-DD')
        : null
    );

    this.confirmacionGuardar = false;
    this.loaderService.activar();
    let generarObjetoGuardado: RegistrarPago =
      this.generarPagoForm.getRawValue();
    this.detallePagoService
      .guardarPago(generarObjetoGuardado)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error === false && respuesta.mensaje === 'Exito') {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Pago realizado correctamente. '
            );
            this.ref.close(true);
          } else {
            this.alertaService.mostrar(TipoAlerta.Info, this.errorMsg);
            console.log(respuesta.mensaje);
          }
        },
        error: (error: HttpErrorResponse) => {
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(error.error.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Error,
            errorMsg || 'Error al guardar la información. Intenta nuevamente.'
          );
        },
      });
  }

  get formulario() {
    return this.generarPagoForm.controls;
  }
}
