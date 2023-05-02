import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-agregar-panteon',
  templateUrl: './modal-agregar-panteon.component.html',
  styleUrls: ['./modal-agregar-panteon.component.scss']
})
export class ModalAgregarPanteonComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      nombrePanteon: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      calle: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      noExterior: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      noInterior: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      colonia: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      municipio: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      estado: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      cp: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      contacto: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      telefono: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ]
    });
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

  get f() {
    return this.form.controls;
  }
}
