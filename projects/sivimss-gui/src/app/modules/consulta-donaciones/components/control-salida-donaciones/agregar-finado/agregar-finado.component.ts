import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {FinadoInterface} from "../../../models/consulta-donaciones-interface";

@Component({
  selector: 'app-agregar-finado',
  templateUrl: './agregar-finado.component.html',
  styleUrls: ['./agregar-finado.component.scss']
})
export class AgregarFinadoComponent implements OnInit {

  agregarFinadoForm!: FormGroup;
  finado: FinadoInterface = {};
  confimacionFinado: boolean = false;

  constructor(
    private readonly ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.incializarAgregarFinadoForm();
  }

  incializarAgregarFinadoForm(): void {
    this.agregarFinadoForm = this.formBuilder.group({
      nombre: [{value: null, disabled: false}, [Validators.required]],
      primerApellido: [{value: null, disabled: false}, [Validators.required]],
      segundoApellido: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  noEspaciosAlPrincipio(posicion:number): void {
    let formularioSeleccionado = [this.f.nombre,this.f.primerApellido,this.f.segundoApellido];
    formularioSeleccionado[posicion].setValue(
      formularioSeleccionado[posicion].value.trimStart()
    );
  }

  confirmacion(): void {
    this.confimacionFinado = true;
  }

  agregar(): void {
    this.ref.close({finado:this.agregarFinadoForm.value});
  }

  regresar(): void {
    this.confimacionFinado = false;
  }

  cancelar(): void{
    this.ref.close({finado:null});
  }

  get f() {
    return this.agregarFinadoForm.controls;
  }

}
