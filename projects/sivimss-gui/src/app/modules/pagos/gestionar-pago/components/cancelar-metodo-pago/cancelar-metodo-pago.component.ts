import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GestionarPagoService} from "../../services/gestionar-pago.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

interface SolicitudCancelacion {
  idFlujo: number,
  idPago: number,
  idPagoDetalle: number,
  motivoCancela: string
}

@Component({
  selector: 'app-cancelar-metodo-pago',
  templateUrl: './cancelar-metodo-pago.component.html',
  styleUrls: ['./cancelar-metodo-pago.component.scss']
})
export class CancelarMetodoPagoComponent implements OnInit {

  registroPago!: MetodoPagoGestion;
  cancelarPagoForm!: FormGroup;
  idFlujo!: number;
  idPago!: number;

  constructor(private formBuilder: FormBuilder,
              public config: DynamicDialogConfig,
              public ref: DynamicDialogRef,
              private gestionarPagoService: GestionarPagoService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,
              private router: Router,
              private readonly activatedRoute: ActivatedRoute,
  ) {
    this.inicializarTipoPagoForm();
  }

  inicializarTipoPagoForm(): void {
    this.cancelarPagoForm = this.formBuilder.group({
      motivoCancelacion: [{value: '', disabled: false}, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.registroPago = this.config.data.pago;
    this.idPago = this.config.data.flujo;
    this.idFlujo = this.config.data.idFlujo;
  }

  guardar(): void {
    const solicitud: SolicitudCancelacion = this.generarSolicitudCancelacion();
    this.gestionarPagoService.cancelarMetodoPago(solicitud).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'El motivo de la cancelación será registrado');
        if (this.idFlujo === 1) {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus de la ODS a Generada');
        } else {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus del nuevo convenio a “Generado');
        }
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'Cambio de estatus de la renovación del convenio se mantendrá como “Vigente”, mientras se encuentre en periodo de renovación');
        this.alertaService.mostrar(TipoAlerta.Exito, 'El sistema actualizará el registro del pago realizado, a fin de tener que cubrir nuevamente el total mediante los métodos de pago disponibles');
        this.alertaService.mostrar(TipoAlerta.Exito, 'El sistema permitirá generar nuevamente pagaré');
        this.ref.close();
        void this.router.navigate(["../../../"], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  generarSolicitudCancelacion(): SolicitudCancelacion {
    return {
      idFlujo: this.idFlujo,
      idPago: this.idPago,
      idPagoDetalle: this.registroPago.idPagoDetalle,
      motivoCancela: this.cancelarPagoForm.get('motivoCancelacion')?.value
    }
  }

  get pc() {
    return this.cancelarPagoForm.controls;
  }

}
