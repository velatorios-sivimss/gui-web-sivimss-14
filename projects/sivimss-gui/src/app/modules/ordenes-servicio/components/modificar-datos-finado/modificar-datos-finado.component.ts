import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-modificar-datos-finado',
  templateUrl: './modificar-datos-finado.component.html',
  styleUrls: ['./modificar-datos-finado.component.scss']
})
export class ModificarDatosFinadoComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        noContrato: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        velatorioPrevision: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        esObito: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        esParaExtremidad: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        matricula: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        curp: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        nss: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        nombre: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        primerApellido: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        edad: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        sexo: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        fechaDefuncion: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        causaDeceso: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        lugarDeceso: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        horaDeceso: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        clinicaAdscripcion: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        unidadProcedencia: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        procedenciaFinado: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ],
        tipoPension: [
          {
            value: null,
            disabled: false
          },
          [
            Validators.required
          ]
        ]
      }),
      direccion: this.formBuilder.group({
        cp: [
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
        ]
      })
    });
  }

  get datosFinado() {
    return (this.form.controls["datosFinado"] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls["direccion"] as FormGroup).controls;
  }

}
