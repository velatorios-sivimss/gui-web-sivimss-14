import {Component, OnInit} from '@angular/core';
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {GestionarPagoService} from "../../services/gestionar-pago.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {ActivatedRoute, Router} from "@angular/router";

interface SolicitudModificacion {
  idPagoDetalle: number,
  motivoModifica: string
}

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
  private router: Router,
  private readonly activatedRoute: ActivatedRoute,
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
    const solicitud: SolicitudModificacion = this.generarSolicitudModificacion();
    this.gestionarPagoService.modificarMetodoPago(solicitud).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'El motivo de la modificación será registrado');
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'Esta selección no implicará cambios en los estatus del registro o en el stock, por lo que no es una cancelación');
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'Esta opción permitirá modificar los métodos de pago utilizados o los montos, debiendo de cumplir con el total');
        this.ref.close();
        void this.router.navigate(["../"], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  generarSolicitudModificacion(): SolicitudModificacion {
    return {
      idPagoDetalle: this.registroPago.idPagoDetalle,
      motivoModifica: this.modificarPagoForm.get('motivoModificacion')?.value
    }
  }

  get pm() {
    return this.modificarPagoForm.controls;
  }


}
