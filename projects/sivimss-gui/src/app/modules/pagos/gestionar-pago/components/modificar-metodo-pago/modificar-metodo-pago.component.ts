import {Component, OnInit} from '@angular/core';
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

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

  get pm() {
    return this.modificarPagoForm.controls;
  }


}
