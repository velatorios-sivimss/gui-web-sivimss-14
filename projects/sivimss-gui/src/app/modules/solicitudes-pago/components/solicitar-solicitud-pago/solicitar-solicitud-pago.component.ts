import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Router } from "@angular/router";
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import { SolicitarSolicitudPago } from '../../models/solicitud-pagos.interface';

@Component({
  selector: 'app-solicitar-solicitud-pago',
  templateUrl: './solicitar-solicitud-pago.component.html',
  styleUrls: ['./solicitar-solicitud-pago.component.scss']
})
export class SolicitarSolicitudPagoComponent implements OnInit {

  solicitarPagoForm!: FormGroup;
  pagoSeleccionado: any = {}
  opcion1: boolean = false;
  opcion2: boolean = false;
  fechaActual: Date = new Date();
  opcionesSolicitud: number = 0;
  catalogotipoSolicitud: TipoDropdown[] = [
    {
      value: 1,
      label: 'Solicitud de bienes y servicios por comprobar',
    },
    {
      value: 2,
      label: 'Solicitud de comprobación de bienes y servicios',
    },
    {
      value: 3,
      label: 'Solicitud de reembolso de fondo fijo revolvente',
    },
    {
      value: 4,
      label: 'Solicitud de pago',
    },
    {
      value: 5,
      label: 'Solicitud de pago a consignantes',
    },
    {
      value: 6,
      label: 'Solicitud de pago por contrato',
    }
  ];

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
    this.solicitarPagoForm = this.formBulder.group({
      tipoSolicitud: [{ value: null, disabled: false }, [ Validators.required]],
    });
  }

  solicitarPago(): void {
    this.referencia.close(false);
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  validaTipoSolicitud(): void {
    debugger
    const idTipo = this.solicitarPagoForm.get('tipoSolicitud')?.value;

    if (idTipo === 1) {
      this.opcion1 = true;
      this.opcion2 = false;
    }
    if (idTipo === 2) {
      this.opcion2 = true;
      this.opcion1 = false;
    }

  }


  get ref() {
    return this.solicitarPagoForm.controls;
  }

}