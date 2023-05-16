import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-registrar-tipo-pago',
  templateUrl: './registrar-tipo-pago.component.html',
  styleUrls: ['./registrar-tipo-pago.component.scss']
})
export class RegistrarTipoPagoComponent implements OnInit {
  tipoPagoForm!: FormGroup;
  indice: number = 0;

  tipoPago!: string;
  pagos: string[] = ["Traslado oficial", "Efectivo"]

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    this.tipoPago = this.config.data;
    this.inicializarTipoPagoForm();
  }

  private inicializarTipoPagoForm(): void {
    this.tipoPagoForm = this.formBuilder.group({
      tipoPago: [{value: this.tipoPago, disabled: false}],
      fecha: [{value: null, disabled: false}],
      noAutorizacion: [{value: null, disabled: false}],
      nombreBanco: [{value: null, disabled: false}],
      importe: [{value: null, disabled: false}],
    })
  }

  aceptar(): void {
    if (this.indice === 1) {
      this.ref.close();
    }
    this.indice++;
  }

  cancelar(): void {

  }


}
