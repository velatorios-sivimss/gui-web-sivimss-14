import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormTarjetaIdentificacion } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/models/form-tarjeta-identificacion.enum";

@Component({
  selector: 'app-modal-generar-tarjeta-identificacion',
  templateUrl: './modal-generar-tarjeta-identificacion.component.html',
  styleUrls: ['./modal-generar-tarjeta-identificacion.component.scss']
})
export class ModalGenerarTarjetaIdentificacionComponent implements OnInit {
  readonly FormTarjetaIdentificacion = FormTarjetaIdentificacion;
  pasoForm: FormTarjetaIdentificacion = FormTarjetaIdentificacion.Seleccionar;
  dummy!: string;
  form!: FormGroup;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.dummy = this.config.data.dummy;
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      nombreOperador: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  mostrarConfirmacion() {
    this.pasoForm = FormTarjetaIdentificacion.Confirmar;
  }

  cancelarConfirmacion() {
    this.pasoForm = FormTarjetaIdentificacion.Seleccionar;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

  guardar() {
    this.ref.close(true);
  }

  get f() {
    return this.form.controls;
  }

}
