import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { Beneficiario } from '../../../models/convenio.interface';

@Component({
  selector: 'app-renovar-convenio-desactivar-beneficiario',
  templateUrl: './renovar-convenio-desactivar-beneficiario.component.html',
  styleUrls: ['./renovar-convenio-desactivar-beneficiario.component.scss']
})
export class RenovarConvenioDesactivarBeneficiarioComponent implements OnInit {
  @Input() beneficiario!: Beneficiario;

  @Input() numBeneficiario: number = 0;

  @Output() desactivarBeneficiario = new EventEmitter<Beneficiario | null>();

  readonly POSICION_PARENTESCO = 0;

  desactivarBeneficiarioForm!: FormGroup;
  catParentesco!: TipoDropdown[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.catParentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      { label: parentesco.label, value: parentesco.value })) || [];
    this.inicializarDesactivarBeneficiarioForm();
  }

  inicializarDesactivarBeneficiarioForm(): void {
    this.desactivarBeneficiarioForm = this.formBuilder.group({
      nombre: [{ value: null, disabled: true }, []],
      primerApellido: [{ value: null, disabled: true }, []],
      segundoApellido: [{ value: null, disabled: true }, []],
      edad: [{ value: null, disabled: true }, []],
      parentesco: [{ value: null, disabled: true }, []],
      curp: [{ value: null, disabled: true }, [Validators.required]],
      rfc: [{ value: null, disabled: true }, []],
      email: [{ value: null, disabled: true }, []],
      telefono: [{ value: null, disabled: true }, []],
      actaNacimiento: [{ value: null, disabled: true }, []],
      ineBeneficiario: [{ value: null, disabled: true }, []],
      comprobanteEstudios: [{ value: null, disabled: true }, []],
      actaMatrimonio: [{ value: null, disabled: true }, []],
      declaracionConcubinato: [{ value: null, disabled: true }, []],
    });

    this.desactivarBeneficiarioForm.patchValue({
      ...this.beneficiario
    });
  }

  cancelar() {
    this.desactivarBeneficiario.emit(null);
  }

  guardar() {
    this.desactivarBeneficiario.emit(this.desactivarBeneficiarioForm.value);
  }

  get dbf() {
    return this.desactivarBeneficiarioForm.controls;
  }
}

