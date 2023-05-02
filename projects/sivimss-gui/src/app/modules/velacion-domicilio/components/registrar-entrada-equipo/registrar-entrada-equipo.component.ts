import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-registrar-entrada-equipo',
  templateUrl: './registrar-entrada-equipo.component.html',
  styleUrls: ['./registrar-entrada-equipo.component.scss']
})
export class RegistrarEntradaEquipoComponent implements OnInit {

  confirmacion: boolean = false;
  registrarEntradaForm!: FormGroup;


  constructor(
    private alertaService: AlertaService,
    private formBulder:FormBuilder,
    private readonly referencia: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.inicializarRegistrarEntradaForm();
  }

  inicializarRegistrarEntradaForm(): void {
    this.registrarEntradaForm = this.formBulder.group({
      fechaEntrada: [{value:null, disabled:false}, [Validators.required]],
      responsableEquiposVelacion: [{value:null, disabled:false}, [Validators.required]],
      matriculaResponsable: [{value:null, disabled:false}, [Validators.required]]
    });

  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Se ha registrado correctamente el registro de entrada del equipo de velación.');
    this.referencia.close();
  }

  cancelar(): void{
    this.referencia.close();
  }

  get ref() {
    return this.registrarEntradaForm.controls;
  }

}
