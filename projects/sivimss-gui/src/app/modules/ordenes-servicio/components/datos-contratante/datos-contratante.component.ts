import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertaService } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";

@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss']
})
export class DatosContratanteComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Operación SIVIMSS'
      },
      {
        icono: '',
        titulo: 'Órdenes de servicio'
      }
    ]);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [{value: null, disabled: false}, [Validators.required]],
        rfc: [{value: null, disabled: false}, [Validators.required]],
        curp: [{value: null, disabled: false}, [Validators.required]],
        nombre: [{value: null, disabled: false}, [Validators.required]],
        primerApellido: [{value: null, disabled: false}, [Validators.required]],
        segundoApellido: [{value: null, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
        sexo: [{value: null, disabled: false}, [Validators.required]],
        nacionalidad: [{value: null, disabled: false}, [Validators.required]],
        lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
        telefono: [{value: null, disabled: false}, [Validators.required]],
        correoElectronico: [{value: null, disabled: false}, [Validators.required]],
        parentesco: [{value: null, disabled: false}, [Validators.required]]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: null, disabled: false}, [Validators.required]],
        noExterior: [{value: null, disabled: false}, [Validators.required]],
        noInterior: [{value: null, disabled: false}, []],
        cp: [{value: null, disabled: false}, [Validators.required]],
        colonia: [{value: null, disabled: false}, [Validators.required]],
        municipio: [{value: null, disabled: false}, [Validators.required]],
        estado: [{value: null, disabled: false}, [Validators.required]]
      })
    });
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

}
