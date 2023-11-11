import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { ActivatedRoute } from '@angular/router';
import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service';
import { DetallePagoService } from '../../services/detalle-pago.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { MensajesSistemaService } from '../../../../services/mensajes-sistema.service';
import { Dropdown } from 'primeng/dropdown';
import { RegistrarPago } from '../../models/registrar-pago.interface';
import * as moment from 'moment/moment';
import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-modal-modificar-pagos',
  templateUrl: './modal-modificar-pagos.component.html',
  styleUrls: ['./modal-modificar-pagos.component.scss'],
})
export class ModalModificarPagosComponent implements OnInit {
  generarPagoForm!: FormGroup;
  idMetodoPago!: TipoDropdown[];
  fechaActual = new Date();
  mensualidades: number = 0;

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
    console.log(this.config.data);
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
      idMetodoPago: [{ value: null, disabled: false }],
      idPlan: [{ value: null, disabled: false }],
      idPagoSFPA: [{ value: null, disabled: false }],
      valeParitaria: [{ value: null, disabled: false }],
      fechaVale: [{ value: null, disabled: false }],
      fechaValeParitaria: [{ value: null, disabled: false }],
      importeValeParitaria: [{ value: null, disabled: false }],
      idBitacoraPago: [{ value: null, disabled: false }],
    });
  }

  inicializarDatos(): void {
    console.log('-------------------------------');
    console.log(this.config.data.detallePago);
    console.log(this.config.data.detalleRegistro);
    console.log(
      moment(this.config.data.detalleRegistro.fechaValeParitario).format(
        'YYYY/MM/DD'
      )
    );

    let fechaValeParitario =
      this.config.data.detalleRegistro.fechaValeParitario;
    if (
      typeof this.config.data.detalleRegistro.fechaValeParitario == 'string'
    ) {
      let [anio, mes, dia] = fechaValeParitario.split('-');
      dia = dia.substr(0, 2);
      fechaValeParitario = new Date(anio + '/' + mes + '/' + dia);
    } else {
      fechaValeParitario = null;
    }

    let fecha = this.config.data.detalleRegistro.fechaValeParitario;
    if (
      typeof this.config.data.detalleRegistro.fechaValeParitario == 'string'
    ) {
      let [anio, mes, dia] = fecha.split('-');
      dia = dia.substr(0, 2);
      fecha = new Date(anio + '/' + mes + '/' + dia);
    } else {
      fecha = null;
    }

    console.log(fecha);
    this.idMetodoPago = this.config.data.metodosPago;
    this.mensualidades = this.config.data.detallePago.noPagos;
    this.formulario.idPlan.setValue(this.config.data.detallePago.idPlanSFPA);
    this.formulario.idPagoSFPA.setValue(
      this.config.data.detallePago.idPagoSFPA
    );
    this.formulario.idBitacoraPago.setValue(
      this.config.data.detalleRegistro.idBitacora
    );

    this.formulario.numeroAutorizacion.setValue(
      this.config.data.detalleRegistro.numeroAutorizacion
    );
    this.formulario.nombreBanco.setValue(
      this.config.data.detalleRegistro.referenciaBancaria
    );
    this.formulario.importe.setValue(
      this.config.data.detalleRegistro.importePago
    );
    this.formulario.folioAutorizacion.setValue(
      this.config.data.detalleRegistro.folioAutorizacion
    );
    this.formulario.fecha.setValue(fecha);

    this.formulario.idMetodoPago.setValue(
      this.config.data.detalleRegistro.idMetodoPago
    );
    this.formulario.valeParitaria.setValue(
      this.config.data.detalleRegistro.numeroValeParitario
    );
    this.formulario.fechaVale.setValue(fechaValeParitario);
    this.formulario.importeValeParitaria.setValue(
      this.config.data.detalleRegistro.importeValeParitario
    );

    this.mostrarCampos(
      this.config.data.detalleRegistro.idMetodoPago,
      this.config.data.detalleRegistro.estatus
    );
    this.formulario.idPagoSFPA.setValue(
      this.config.data.detallePago.idPagoSFPA
    );
    this.formulario.idMetodoPago.setValue(
      this.config.data.detalleRegistro.idMetodoPago
    );
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

    const idTipoPago = Number(dd.selectedOption.value);
    this.mostrarCampos(idTipoPago, dd.selectedOption.label);
  }

  mostrarCampos(idTipoPago: number, tipoPago: string): void {
    if (tipoPago.toUpperCase().includes('TARJETA CRÉDITO') || idTipoPago == 3) {
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
    if (tipoPago.toUpperCase().includes('TARJETA DÉBITO') || idTipoPago == 4) {
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
    if (tipoPago.toUpperCase().includes('TRANSFERENCIA') || idTipoPago == 6) {
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
    if (tipoPago.toUpperCase().includes('DEPÓSITO') || idTipoPago == 7) {
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
    if (tipoPago.toUpperCase().includes('VALE PARITARIA') || idTipoPago == 1) {
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

    console.log(this.generarPagoForm.getRawValue());

    this.confirmacionGuardar = false;
    this.loaderService.activar();
    let generarObjetoGuardado: RegistrarPago =
      this.generarPagoForm.getRawValue();
    this.detallePagoService
      .modificarPago(generarObjetoGuardado)
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
