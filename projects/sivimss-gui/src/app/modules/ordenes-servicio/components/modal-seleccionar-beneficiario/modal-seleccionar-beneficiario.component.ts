import {Component} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-seleccionar-beneficiario',
  templateUrl: './modal-seleccionar-beneficiario.component.html',
  styleUrls: ['./modal-seleccionar-beneficiario.component.scss']
})
export class ModalSeleccionarBeneficiarioComponent {

  beneficiarios: any[] = [
    {
      id: 0, nombre: 'Denia Lima Hernandez', seleccionado: false
    },
    {
      id: 1, nombre: 'Jimena Lima Hernandez', seleccionado: false
    },
    {
      id: 2, nombre: 'Sergio Lima Hernandez', seleccionado: false
    }
  ];

  beneficiarioSeleccionado: any = {
    id: 10, nombre: 'Gerardo Lima Lopez', seleccionado: true
  };


  constructor(
    private readonly formBuilder: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
  }


}
