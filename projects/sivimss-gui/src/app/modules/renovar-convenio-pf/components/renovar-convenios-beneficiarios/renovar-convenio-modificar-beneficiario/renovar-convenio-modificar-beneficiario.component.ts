import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { Beneficiario } from '../../../models/convenio.interface';
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from 'projects/sivimss-gui/src/app/utils/constantes';

@Component({
  selector: 'app-renovar-convenio-modificar-beneficiario',
  templateUrl: './renovar-convenio-modificar-beneficiario.component.html',
  styleUrls: ['./renovar-convenio-modificar-beneficiario.component.scss']
})
export class RenovarConvenioModificarBeneficiarioComponent implements OnInit {
  @Input() beneficiario!: Beneficiario;

  @Input() numBeneficiario: number = 0;

  @Output() actualizarBeneficiario = new EventEmitter<Beneficiario | null>();

  readonly POSICION_PARENTESCO = 0;

  modificarBeneficiarioForm!: FormGroup;
  catParentesco!: TipoDropdown[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.catParentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      { label: parentesco.label, value: parentesco.value })) || [];
    this.inicializarModificarBeneficiarioForm();
  }

  inicializarModificarBeneficiarioForm(): void {
    this.modificarBeneficiarioForm = this.formBuilder.group({
      nombre: [{ value: null, disabled: false }, []],
      primerApellido: [{ value: null, disabled: false }, []],
      segundoApellido: [{ value: null, disabled: false }, []],
      edad: [{ value: null, disabled: false }, [Validators.minLength(2), Validators.maxLength(2)]],
      parentesco: [{ value: null, disabled: false }, []],
      curp: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      actaNacimiento: [{ value: null, disabled: false }, []],
      email: [{ value: null, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      telefono: [{ value: null, disabled: false }, [Validators.maxLength(11)]],
    });

    this.modificarBeneficiarioForm.patchValue({
      ...this.beneficiario
    });
  }

  cancelar() {
    this.actualizarBeneficiario.emit(null);
  }

  guardar() {
    if (this.modificarBeneficiarioForm.valid) {
      this.actualizarBeneficiario.emit(this.modificarBeneficiarioForm.value);
    }
  }

  get mbf() {
    return this.modificarBeneficiarioForm.controls;
  }
}

