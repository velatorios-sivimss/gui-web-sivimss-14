import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-cancelar-solicitud-pago',
  templateUrl: './cancelar-solicitud-pago.component.html',
  styleUrls: ['./cancelar-solicitud-pago.component.scss']
})
export class CancelarSolicitudPagoComponent implements OnInit {

  cancelarPagoForm!: FormGroup;
  pagoSeleccionado: any = {}

  constructor(
    private router: Router,
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data;
      console.log(this.pagoSeleccionado)
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.cancelarPagoForm = this.formBulder.group({
      motivo: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
    });
  }

  cancelarPago(): void {
    this.referencia.close(false);
  }

  cancelar(): void {
    this.referencia.close(false);
  }


  get ref() {
    return this.cancelarPagoForm.controls;
  }

}
