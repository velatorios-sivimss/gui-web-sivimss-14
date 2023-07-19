import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

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

  get pc() {
    return this.cancelarPagoForm.controls;
  }

}
