import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-no-utilizar-servicio',
  templateUrl: './modal-no-utilizar-servicio.component.html',
  styleUrls: ['./modal-no-utilizar-servicio.component.scss']
})
export class ModalNoUtilizarServicioComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      motivo: [{value: null, disabled: false}, [Validators.required]]
    })
  }

  cerrarModal(): void {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

  get f() {
    return this.form.controls;
  }
}
