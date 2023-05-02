import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios/constants/dummies";
import * as moment from "moment";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {RegistroOtorgamientoServicios} from "../../models/registro-otorgamiento-servicios-interface";

@Component({
  selector: 'app-agregar-registro-otorgamiento-servicios',
  templateUrl: './agregar-registro-otorgamiento-servicios.component.html',
  styleUrls: ['./agregar-registro-otorgamiento-servicios.component.scss']
})
export class AgregarRegistroOtorgamientoServiciosComponent implements OnInit {

  form!: FormGroup;

  registro = Date.now();
  fechaActual:string ="";
  confirmacionAgregar:boolean = false;

  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  registroOtorgamiento: RegistroOtorgamientoServicios= {};

  constructor(
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.fechaActual = moment(new Date()).format('DD/MM/YYYY');
    this.inicializarForm();
  }

  inicializarForm() {
    this.form = this.formBuilder.group({
      tipoServicio:[{value: null, disabled:false},[Validators.required]],
      certificadoCremacion:[{value: null, disabled:false}],
      notasServicio:[{value: null, disabled:false}]
    });
  }

  confirmarAgregarOrderServicio(): void {
    this.confirmacionAgregar = true;
    this.registroOtorgamiento = {
      ...this.form.value
    };
  }

  regresarPantalla(respuesta:boolean): void{
    this.confirmacionAgregar = !respuesta;
  }

  cancelar(): void {
    this.ref.close();
  }

  get f(){
    return this.form.controls;
  }

}
