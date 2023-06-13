import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {DynamicDialogRef} from "primeng/dynamicdialog";

import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {ActivatedRoute} from "@angular/router";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";

@Component({
  selector: 'app-agregar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './agregar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class AgregarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiarioForm!: FormGroup;

  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES;
  parentesco!: TipoDropdown[];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.inicializarBeneficiarioForm();
  }

  inicializarBeneficiarioForm(): void {
    this.beneficiarioForm = this.formBuilder.group({
              velatorio: [{value: null, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
                   edad: [{value: null, disabled: false}, [Validators.required]],
                 nombre: [{value: null, disabled: false}, [Validators.required]],
         primerApellido: [{value: null, disabled: false}, [Validators.required]],
        segundoApellido: [{value: null, disabled: false}, [Validators.required]],
             parentesco: [{value: null, disabled: false}, [Validators.required]],
                   curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                    rfc: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
         actaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
               telefono: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  aceptar(): void {
    this.ref.close(this.beneficiarioForm.value);
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.beneficiarioForm.controls;
  }
}
