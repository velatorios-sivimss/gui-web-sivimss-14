import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-agregar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './agregar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class AgregarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {


  beneficiarioForm!: FormGroup;

  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES;
  parentesco: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.inicializarBeneficiarioForm();
  }

  inicializarBeneficiarioForm(): void {
    this.beneficiarioForm = this.formBuilder.group({
      velatorio:[{value: null, disabled: false}, [Validators.required]],
      fecha:[{value: null, disabled: false}, [Validators.required]],
      edad:[{value: null, disabled: false}, [Validators.required]],
      nombre:[{value: null, disabled: false}, [Validators.required]],
      primerApellido:[{value: null, disabled: false}, [Validators.required]],
      segundoApellido:[{value: null, disabled: false}, [Validators.required]],
      parentesco:[{value: null, disabled: false}, [Validators.required]],
      curp:[{value: null, disabled: false}, [Validators.required]],
      rfc:[{value: null, disabled: false}, [Validators.required]],
      actaNacimiento:[{value: null, disabled: false}, [Validators.required]],
      correoElectronico:[{value: null, disabled: false}, [Validators.required]],
      telefono:[{value: null, disabled: false}, [Validators.required]]
    });
  }

  aceptar(): void {
    this.ref.close(this.beneficiarioForm.value);
  }

  cancelar(): void {
    this.ref.close();
  }

  get abf() {
    return this.beneficiarioForm.controls;
  }
}
