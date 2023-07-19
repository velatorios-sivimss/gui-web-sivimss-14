import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GestionarPagoService} from "../../services/gestionar-pago.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-cancelar-metodo-pago',
  templateUrl: './cancelar-metodo-pago.component.html',
  styleUrls: ['./cancelar-metodo-pago.component.scss']
})
export class CancelarMetodoPagoComponent implements OnInit {

  registroPago!: MetodoPagoGestion;
  cancelarPagoForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              public config: DynamicDialogConfig,
              public ref: DynamicDialogRef,
              private gestionarPagoService: GestionarPagoService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,
  ) {
    this.inicializarTipoPagoForm();
  }

  inicializarTipoPagoForm(): void {
    this.cancelarPagoForm = this.formBuilder.group({
      motivoCancelacion: [{value: '', disabled: false}, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.registroPago = this.config.data;
  }

  guardar(): void {
    const solicitud = {};
    this.gestionarPagoService.cancelarMetodoPago(solicitud).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago modificado correctamente');
        this.ref.close();
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  get pc() {
    return this.cancelarPagoForm.controls;
  }

}
