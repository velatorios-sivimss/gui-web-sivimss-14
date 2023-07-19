import {Component, OnInit} from '@angular/core';
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {GestionarPagoService} from "../../services/gestionar-pago.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-modificar-metodo-pago',
  templateUrl: './modificar-metodo-pago.component.html',
  styleUrls: ['./modificar-metodo-pago.component.scss']
})
export class ModificarMetodoPagoComponent implements OnInit {

  registroPago!: MetodoPagoGestion;
  modificarPagoForm!: FormGroup;

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
    this.modificarPagoForm = this.formBuilder.group({
      motivoModificacion: [{value: '', disabled: false}, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.registroPago = this.config.data;
  }

  guardar(): void {
    const solicitud = {};
    this.gestionarPagoService.modificarMetodoPago(solicitud).subscribe({
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

  get pm() {
    return this.modificarPagoForm.controls;
  }


}
