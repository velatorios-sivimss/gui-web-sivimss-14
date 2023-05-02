import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-cancelar-orden-servicio',
  templateUrl: './cancelar-orden-servicio.component.html',
  styleUrls: ['./cancelar-orden-servicio.component.scss']
})
export class CancelarOrdenServicioComponent implements OnInit {

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm() {
    this.form = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  guardar() {

  }

  get f() {
    return this.form.controls;
  }
}
