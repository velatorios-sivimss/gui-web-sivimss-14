import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { ContratoSfpaInterface} from "../../../models/contrato-sfpa.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";

@Component({
  selector: 'app-modal-convenio-sfpa',
  templateUrl: './modal-convenio-sfpa.component.html',
  styleUrls: ['./modal-convenio-sfpa.component.scss']
})
export class ModalConvenioSfpaComponent implements OnInit {
  form!: FormGroup;
  contrato!: ContratoSfpaInterface;
  contratantes: TipoDropdown[] = [];
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.contrato = this.config.data.contratantes;
    this.contratantes =  mapearArregloTipoDropdown(this.config.data.contratantes.contratante,
      "tipo","idPersona")
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      contratante: [{value:null, disabled: false}, [Validators.required]],
    })
  }

  cancelar(): void {
    this.ref.close();
  }

  guardar(): void {
    this.ref.close(this.formulario.contratante.value)
  }

  get formulario() {
    return this.form.controls;
  }

}
