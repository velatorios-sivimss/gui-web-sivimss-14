import { Component, OnInit } from '@angular/core';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OperadoresPorVelatorio} from "../../models/operadores-por-velatorio.interface";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-agregar-operadores-por-velatorio',
  templateUrl: './agregar-operadores-por-velatorio.component.html',
  styleUrls: ['./agregar-operadores-por-velatorio.component.scss']
})
export class AgregarOperadoresPorVelatorioComponent implements OnInit {


  ventanaConfirmacion: boolean = false;

  agregarOperadorForm!: FormGroup;

  nuevoOperador:OperadoresPorVelatorio = {};

  entidadFederativa: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(private formBuilder: FormBuilder,
              public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    this.inicializarAgregarServicioForm();
  }

  inicializarAgregarServicioForm(): void {
    this.agregarOperadorForm = this.formBuilder.group({
      id:[{value:null, disabled: true}],
      curp: [{value:null, disabled: false},[Validators.required]],
      numeroEmpleado: [{value:null, disabled: false},[Validators.required]],
      matricula: [{value:null, disabled: false},[Validators.required]],
      nombre: [{value:null, disabled: false},[Validators.required]],
      primerApellido: [{value:null, disabled: false},[Validators.required]],
      segundoApellido: [{value:null, disabled: false},[Validators.required]],
      fechaNaciemiento: [{value:null, disabled: false},[Validators.required]],
      fechaIngreso: [{value:null, disabled: false},[Validators.required]],
      sueldoBase: [{value:null, disabled: false}],
      velatorio: [{value:null, disabled: false},[Validators.required]],
      fechaBaja: [{value:null, disabled: false}],
      diasDescanso: [{value:null, disabled: false},[Validators.required]],
      antiguedad: [{value:null, disabled: false}],
      correoElectronico: [{value:null, disabled: false},[Validators.required]],
      puesto: [{value:null, disabled: false},[Validators.required]],
      estatus: [{value:true, disabled: false},[Validators.required]],
      entidadFederativa: [{value:null, disabled: false},[Validators.required]],
    });
  }

  cancelar(): void {
  this.ref.close();
  }

  confirmarAgregarOperador(): void {
    this.nuevoOperador = {
      id:null,
      ...this.agregarOperadorForm.value
    }
    this.ventanaConfirmacion = true;
  }

  aceptaConfirmacion(event: boolean): void {
    this.ref.close(true);
  }

  get fao() {
    return this.agregarOperadorForm.controls;
  }

}
