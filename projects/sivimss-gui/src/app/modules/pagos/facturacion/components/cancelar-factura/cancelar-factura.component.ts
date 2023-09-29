import {Component, OnInit} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.scss']
})
export class CancelarFacturaComponent implements OnInit {

  motivos: TipoDropdown[] = [];
  cancelarForm!: FormGroup;
  mostrarDialogCancelacion: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.inicializarCancelarForm();
  }

  inicializarCancelarForm(): void {
    this.cancelarForm = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}, [Validators.required]],
      folioRelacionado: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  get fc() {
    return this.cancelarForm.controls;
  }

}
