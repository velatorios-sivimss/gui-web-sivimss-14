import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-eliminar-articulo',
  templateUrl: './modal-eliminar-articulo.component.html',
  styleUrls: ['./modal-eliminar-articulo.component.scss'],
})
export class ModalEliminarArticuloComponent implements OnInit {
  form!: FormGroup;
  constructor(
    private readonly formBuilder: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      motivo: [{ value: null, disabled: false }, [Validators.required]],
    });
  }
  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(null);
  }

  get f() {
    return this.form.controls;
  }

  noEspaciosAlPrincipio(posicion: number) {
    const formName = [this.f.motivo.value];
    formName[posicion].setValue(formName[posicion].value.trimStart());
  }

  aceptarModal(): void {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    let salida = this.f.motivo.value;
    console.log(salida);
    this.ref.close(salida);
  }
}
