import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {OperadoresPorVelatorio} from "../../models/operadores-por-velatorio.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";

@Component({
  selector: 'app-modificar-operadores-por-velatorio',
  templateUrl: './modificar-operadores-por-velatorio.component.html',
  styleUrls: ['./modificar-operadores-por-velatorio.component.scss']
})
export class ModificarOperadoresPorVelatorioComponent implements OnInit {

  @Input() operadorSeleccionado!: OperadoresPorVelatorio;
  @Input() origen!: string;

  modificarOperadorForm!: FormGroup;

  operadorModificado : OperadoresPorVelatorio = {};

  entidadFederativa: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES;

  ventanaConfirmacion: boolean = false;

  constructor(private formBuilder: FormBuilder,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig)
  { }

  ngOnInit(): void {
    if(this.config?.data){
      this.operadorSeleccionado = this.config.data;
      this.origen = this.config.data.origen;
    }

    this.inicializarAgregarServicioForm(this.operadorSeleccionado);
  }

  inicializarAgregarServicioForm(op:OperadoresPorVelatorio ): void {
    this.modificarOperadorForm = this.formBuilder.group({
      id:[{value:op?.id, disabled: true}],
      curp: [{value:op?.curp, disabled: false},[Validators.required]],
      numeroEmpleado: [{value:op?.numeroEmpleado, disabled: false},[Validators.required]],
      matricula: [{value:op?.matricula, disabled: false},[Validators.required]],
      nombre: [{value:op?.nombre, disabled: false},[Validators.required]],
      primerApellido: [{value:op?.primerApellido, disabled: false},[Validators.required]],
      segundoApellido: [{value:op?.segundoApellido, disabled: false},[Validators.required]],
      fechaNaciemiento: [{value:op?.fechaNaciemiento, disabled: false},[Validators.required]],
      fechaIngreso: [{value:op?.fechaIngreso, disabled: false},[Validators.required]],
      sueldoBase: [{value:op?.fechaBaja, disabled: false}],
      velatorio: [{value:op?.velatorio, disabled: false},[Validators.required]],
      fechaBaja: [{value:op?.fechaBaja, disabled: false}],
      diasDescanso: [{value:op?.diasDescanso, disabled: false},[Validators.required]],
      antiguedad: [{value:op?.antiguedad, disabled: false}],
      correoElectronico: [{value:op?.correoElectronico, disabled: false},[Validators.required]],
      puesto: [{value:op?.puesto, disabled: false},[Validators.required]],
      estatus: [{value:op?.estatus, disabled: false},[Validators.required]],
      entidadFederativa: [{value:op?.entidadFederativa, disabled: false},[Validators.required]],
    });
  }

  confirmarModificarOperador(): void {
    this.ventanaConfirmacion= true;
    this.operadorModificado = {
      ...this.modificarOperadorForm.value
    }
  }

  aceptaConfirmacion(respuesta: boolean): void{
    this.ref.close(respuesta);
  }

  aceptar(): void {
    this.ref.close(true);
  }

  cancelar(): void {
    this.ref.close();
  }

  get fmo() {
    return this.modificarOperadorForm.controls;
  }

}
