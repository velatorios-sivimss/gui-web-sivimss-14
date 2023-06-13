import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {ActivatedRoute} from "@angular/router";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";

@Component({
  selector: 'app-modificar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './modificar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./modificar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class ModificarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiarioForm!: FormGroup;

  datosBeneficiario!: BeneficiarioInterface;

  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES;
  parentesco!: TipoDropdown[];

  constructor(
    private route: ActivatedRoute,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.datosBeneficiario = this.config.data;
    let respuesta = this.route.snapshot.data['respuesta'];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.inicializarBeneficiarioForm();
  }

  inicializarBeneficiarioForm(): void {
    this.beneficiarioForm = this.formBuilder.group({
      velatorio: [{value: this.datosBeneficiario.velatorio, disabled: false}, [Validators.required]],
      fechaNacimiento: [{value: this.datosBeneficiario.fechaNacimiento, disabled: false}, [Validators.required]],
      edad: [{value: this.datosBeneficiario.edad, disabled: false}, [Validators.required]],
      nombre: [{value: this.datosBeneficiario.nombre, disabled: false}, [Validators.required]],
      primerApellido: [{value: this.datosBeneficiario.primerApellido, disabled: false}, [Validators.required]],
      segundoApellido: [{value: this.datosBeneficiario.segundoApellido, disabled: false}, [Validators.required]],
      parentesco: [{value: this.datosBeneficiario.parentesco, disabled: false}, [Validators.required]],
      curp: [{value: this.datosBeneficiario.curp, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: this.datosBeneficiario.rfc, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
      actaNacimiento: [{value: this.datosBeneficiario.actaNacimiento, disabled: false}, [Validators.required]],
      correoElectronico: [{value: this.datosBeneficiario.correoElectronico, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
      telefono: [{value: this.datosBeneficiario.telefono, disabled: false}, [Validators.required]]
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
