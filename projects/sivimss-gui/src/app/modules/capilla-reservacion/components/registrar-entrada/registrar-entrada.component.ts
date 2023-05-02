import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios-funerarios/constants/dummies";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";


@Component({
  selector: 'app-registrar-entrada',
  templateUrl: './registrar-entrada.component.html',
  styleUrls: ['./registrar-entrada.component.scss']
})
export class RegistrarEntradaComponent implements OnInit {

  registrarEntradaForm!: FormGroup;

  confirmacion: boolean = false;

  capilla:TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    // private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly refModal: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarRegistrarEntradaForm();
  }

  actualizarBreadcrumb(): void{
    // this.breadcrumbService.actualizar([]);

    //Has registrado la entrada/inicio del servicio correctamente.
  }

  inicializarRegistrarEntradaForm(): void {
    this.registrarEntradaForm = this.formBuilder.group({
      capilla: [{value: null,disabled: false}, [Validators.required]],
      folioODS: [{value: null,disabled: false}, [Validators.required]],
      nombreContratante: [{value: null,disabled: false}, [Validators.required]],
      nombreFinado: [{value: null,disabled: false}, [Validators.required]],
      registroEntrada: [{value: null,disabled: false}, [Validators.required]]
    });
  }

  confirmarEntrada(valor?:boolean): void {
    this.confirmacion = true;
    if(valor){
      this.alertaService.mostrar(TipoAlerta.Exito, 'Has registrado la entrada/inicio del servicio correctamente.');
      this.refModal.close();
    }
  }

  cancelar(): void {
    this.refModal.close();
  }

  get ref() {
    return this.registrarEntradaForm.controls;
  }

}
