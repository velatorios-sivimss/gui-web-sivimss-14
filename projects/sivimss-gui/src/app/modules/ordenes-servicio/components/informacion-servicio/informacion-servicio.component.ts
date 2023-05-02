import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { ModalAgregarAtaudComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-ataud/modal-agregar-ataud.component";
import { ModalAgregarPanteonComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-panteon/modal-agregar-panteon.component";
import { ModalSeleccionarBeneficiarioComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component";

@Component({
  selector: 'app-informacion-servicio',
  templateUrl: './informacion-servicio.component.html',
  styleUrls: ['./informacion-servicio.component.scss']
})
export class InformacionServicioComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      lugarVelacion:  this.formBuilder.group({
        capilla: [{value: null, disabled: false}, [Validators.required]],
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      lugarCremacion:  this.formBuilder.group({
        sala: [{value: null, disabled: false}, [Validators.required]],
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      inhumacion:  this.formBuilder.group({
        agregarPanteon: [{value: null, disabled: false}, [Validators.required]]
      }),
      recoger:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      instalacionServicio:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      cortejo:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]],
        gestionadoPorPromotor: [{value: null, disabled: false}, [Validators.required]]
      })
    });
  }

  abrirModalAgregarPanteon():void{
    const ref = this.dialogService.open(ModalAgregarPanteonComponent, {
      header: 'Agregar panteón',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalAgregarPanteonComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalAgregarPanteonComponent
      }
    });
  }

  get lugarVelacion() {
    return (this.form.controls['lugarVelacion'] as FormGroup).controls;
  }

  get lugarCremacion() {
    return (this.form.controls['lugarCremacion'] as FormGroup).controls;
  }

  get recoger() {
    return (this.form.controls['recoger'] as FormGroup).controls;
  }

  get instalacionServicio() {
    return (this.form.controls['instalacionServicio'] as FormGroup).controls;
  }

  get inhumacion() {
    return (this.form.controls['inhumacion'] as FormGroup).controls;
  }

  get cortejo() {
    return (this.form.controls['cortejo'] as FormGroup).controls;
  }

}
