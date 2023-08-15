import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

interface DatosRegistro {
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number
}

@Component({
  selector: 'app-registrar-vale-paritaria',
  templateUrl: './registrar-vale-paritaria.component.html',
  styleUrls: ['./registrar-vale-paritaria.component.scss']
})
export class RegistrarValeParitariaComponent implements OnInit {

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoAgregarPago: number = 1;

  valeParitariaForm!: FormGroup;
  resumenSolicitud!: any;

  registroPago!: DatosRegistro;
  total: number = 0;

  constructor(private formBuilder: FormBuilder,
              public config: DynamicDialogConfig,
              public ref: DynamicDialogRef,) {
  }

  ngOnInit(): void {
    this.total = this.config.data.total;
    this.registroPago = this.config.data.datosRegistro;
    this.inicializarValeForm();
  }

  inicializarValeForm(): void {
    this.valeParitariaForm = this.formBuilder.group({
      numAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      fechaValeAGF: [{value: null, disabled: false}, [Validators.required]],
      importePago: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  aceptar(): void {
    this.resumenSolicitud = this.valeParitariaForm.getRawValue();
    this.pasoAgregarPago = this.RESUMEN_DE_PAGO;
  }

  cancelar(): void {
    this.ref.close();
  }

  guardar(): void {

  }
}
