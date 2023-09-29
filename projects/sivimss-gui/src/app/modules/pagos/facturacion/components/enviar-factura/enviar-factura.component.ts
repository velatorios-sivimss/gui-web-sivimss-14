import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-enviar-factura',
  templateUrl: './enviar-factura.component.html',
  styleUrls: ['./enviar-factura.component.scss']
})
export class EnviarFacturaComponent implements OnInit {

  enviarForm!: FormGroup;
  mostrarDialogEnviar: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.inicializarEnviarForm();
  }

  inicializarEnviarForm(): void {
    this.enviarForm = this.formBuilder.group({
      correoElectronico: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  get fc() {
    return this.enviarForm.controls;
  }

}
