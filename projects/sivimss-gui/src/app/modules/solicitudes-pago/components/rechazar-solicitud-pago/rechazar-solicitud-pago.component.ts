import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import {Router} from "@angular/router";
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import { RechazarSolicitudPago } from '../../models/solicitud-pagos.interface';

@Component({
  selector: 'app-rechazar-solicitud-pago',
  templateUrl: './rechazar-solicitud-pago.component.html',
  styleUrls: ['./rechazar-solicitud-pago.component.scss']
})
export class RechazarSolicitudPagoComponent implements OnInit {

  rechazarPagoForm!: FormGroup;
  pagoSeleccionado: any = {}


  constructor(
    private router: Router,
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private balanceCajaService: SolicitudesPagoService,
  ) { }

 
  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data.pagoSeleccionado;
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.rechazarPagoForm = this.formBulder.group({
      motivoRechazo: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
    });
  }

  cancelarPago(): void {
    this.referencia.close(false);
  }

  cancelar(): void {
    this.referencia.close(false);
  }


  get ref() {
    return this.rechazarPagoForm.controls;
  }

}