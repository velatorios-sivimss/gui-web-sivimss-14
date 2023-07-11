import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modificar-informacion-servicio',
  templateUrl: './modificar-informacion-servicio.component.html',
  styleUrls: ['./modificar-informacion-servicio.component.scss'],
})
export class ModificarInformacionServicioComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  form!: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      lugarVelacion: this.formBuilder.group({
        capilla: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fecha: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      lugarCremacion: this.formBuilder.group({
        sala: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fecha: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      inhumacion: this.formBuilder.group({
        agregarPanteon: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      seRecogera: this.formBuilder.group({
        fecha: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      servicioSeraInstalado: this.formBuilder.group({
        fecha: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      cortejoSera: this.formBuilder.group({
        fecha: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      servicioGestionadoPorPromotor: this.formBuilder.group({
        servicioGestionadoPorPromotor: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        hora: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        promotor: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
    });
  }

  get lugarVelacion() {
    return (this.form.controls['lugarVelacion'] as FormGroup).controls;
  }

  get lugarCremacion() {
    return (this.form.controls['lugarCremacion'] as FormGroup).controls;
  }

  get inhumacion() {
    return (this.form.controls['inhumacion'] as FormGroup).controls;
  }

  get seRecogera() {
    return (this.form.controls['seRecogera'] as FormGroup).controls;
  }

  get servicioSeraInstalado() {
    return (this.form.controls['servicioSeraInstalado'] as FormGroup).controls;
  }

  get cortejoSera() {
    return (this.form.controls['cortejoSera'] as FormGroup).controls;
  }

  get servicioGestionadoPorPromotor() {
    return (this.form.controls['servicioGestionadoPorPromotor'] as FormGroup)
      .controls;
  }
}
