import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-registrar-vale-paritaria',
  templateUrl: './registrar-vale-paritaria.component.html',
  styleUrls: ['./registrar-vale-paritaria.component.scss']
})
export class RegistrarValeParitariaComponent implements OnInit {

  valeParitariaForm!: FormGroup;
  indice: number = 0;
  delegaciones: TipoDropdown[] = [];

  constructor(private formBuilder: FormBuilder, public config: DynamicDialogConfig,
              public ref: DynamicDialogRef,) {
    this.inicializarValeForm();
  }

  ngOnInit(): void {
  }

  inicializarValeForm(): void {
    this.valeParitariaForm = this.formBuilder.group({
      matricula: [{value: null, disabled: false}],
      delegacion: [{value: null, disabled: false}],
      importePrestamo: [{value: null, disabled: false}],
    });
  }

  aceptar(): void {
    if (this.indice === 3) {
      this.ref.close();
      return;
    }
    this.indice++;
  }

  cancelar(): void {
    if (this.indice === 0) {
      this.ref.close();
      return;
    }
    this.indice--;
  }
}
