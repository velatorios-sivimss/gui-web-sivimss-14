import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modificar-datos-caracteristicas-contratante',
  templateUrl: './modificar-datos-caracteristicas-contratante.component.html',
  styleUrls: ['./modificar-datos-caracteristicas-contratante.component.scss'],
})
export class ModificarDatosCaracteristicasContratanteComponent
  implements OnInit
{
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  form!: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        parentesco: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        direccion: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        colonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
    });
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }
  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }
}
