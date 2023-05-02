import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-agregar-ataud',
  templateUrl: './modal-agregar-ataud.component.html',
  styleUrls: ['./modal-agregar-ataud.component.scss']
})
export class ModalAgregarAtaudComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      ataud: [{value: null, disabled: false}, [Validators.required]],
      proveedor: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

  get f() {
    return this.form.controls;
  }

}
