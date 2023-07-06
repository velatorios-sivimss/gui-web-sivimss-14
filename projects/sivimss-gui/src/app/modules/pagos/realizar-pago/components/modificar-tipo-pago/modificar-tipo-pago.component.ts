import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-modificar-tipo-pago',
  templateUrl: './modificar-tipo-pago.component.html',
  styleUrls: ['./modificar-tipo-pago.component.scss']
})
export class ModificarTipoPagoComponent implements OnInit {

  pagosDeshabilitados: number[] = [5, 8];
  fechasDeshabilitadas: number[] = [3, 4, 5];
  idPago: number = 0;
  total: number = 0;

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoModificarPago: number = 1;

  tipoPagoForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.inicializarTipoPagoForm();
  }

  inicializarTipoPagoForm(): void {
    this.tipoPagoForm = this.formBuilder.group({
      tipoPagoAnterior: [{value: '', disabled: true}],
      tipoPago: [{value: '', disabled: false}],
      fecha: [{value: null, disabled: false}, [Validators.required]],
      noAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      nombreBanco: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  get pf() {
    return this.tipoPagoForm?.controls
  }

}
