import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { MenuItem } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";


import { MENU_STEPPER_AGREGAR_PERSONA } from "../../constants/menu-steppers-agregar-persona";
import { CATALOGOS_DUMMIES } from "../../constants/dummies";
import { TipoDropdown } from "../../../../models/tipo-dropdown";

import { BeneficiarioInterface } from "../../models/beneficiario.interface";
import { PersonaInterface } from "../../models/persona.interface";

import {
  AgregarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "../detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";

@Component({
  selector: 'app-agregar-persona-convenios-prevision-funeraria',
  templateUrl: './agregar-persona-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-persona-convenios-prevision-funeraria.component.scss'],
  providers: [DialogService]
})
export class AgregarPersonaConveniosPrevisionFunerariaComponent implements OnInit {

  @Output() personaConvenio = new EventEmitter<PersonaInterface>();


  menuStep: MenuItem[] = MENU_STEPPER_AGREGAR_PERSONA;
  indice: number = 0;

  personaForm!: FormGroup;
  beneficiarioRef!: DynamicDialogRef;
  detalleBeneficiarioRef!: DynamicDialogRef;

  sexo: TipoDropdown[] = CATALOGOS_DUMMIES;
  nacionalidad: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;
  enfermedadPrexistente: TipoDropdown[] = CATALOGOS_DUMMIES;

  beneficiario: BeneficiarioInterface[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarFormPersona();
  }

  inicializarFormPersona(): void {
    this.personaForm = this.formBuilder.group({
      curp: [{value: null, disabled: false}, [Validators.required]],
      rfc: [{value: null, disabled: false}, [Validators.required]],
      matricula: [{value: null, disabled: false}, [Validators.required]],
      nombre: [{value: null, disabled: false}, [Validators.required]],
      primerApellido: [{value: null, disabled: false}, [Validators.required]],
      segundoApellido: [{value: null, disabled: false}, [Validators.required]],
      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      sexo: [{value: null, disabled: false}, [Validators.required]],
      nacionalidad: [{value: null, disabled: false}, [Validators.required]],
      lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required]],
      telefono: [{value: null, disabled: false}, [Validators.required]],
      calle: [{value: null, disabled: false}, [Validators.required]],
      noExterior: [{value: null, disabled: false}, [Validators.required]],
      noInterior: [{value: null, disabled: false}, [Validators.required]],
      cp: [{value: null, disabled: false}, [Validators.required]],
      colonia: [{value: null, disabled: false}, [Validators.required]],
      municipio: [{value: null, disabled: false}, [Validators.required]],
      estado: [{value: null, disabled: false}, [Validators.required]],
      tipoPaquete: [{value: null, disabled: false}, [Validators.required]],
      enfermedadPrexistente: [{value: null, disabled: false}, [Validators.required]],
      descEnfermedadPrexistente: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  abrirModalAgregarBeneficiario(): void {
    this.beneficiarioRef = this.dialogService.open(AgregarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header: "Agregar beneficiario",
      width: "920px",
    });

    this.beneficiarioRef.onClose.subscribe((beneficiarioModal: BeneficiarioInterface) => {
      if (beneficiarioModal) {
        this.beneficiario.push(beneficiarioModal);
        console.log(beneficiarioModal);
      }
    });
  }

  abrirModalDetalleBeneficiario(detalleBeneficiario: BeneficiarioInterface): void {
    this.detalleBeneficiarioRef = this.dialogService.open(DetalleBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Ver detalle de beneficiario",
      width:"920px",
      data: detalleBeneficiario,
    });
  }

  abrirModalEliminarBeneficiario(eliminarBeneficiario: BeneficiarioInterface): void {
    this.beneficiario = this.beneficiario.filter((element) => {
      return eliminarBeneficiario.curp != element.curp;
    })
  }

  aceptar(): void {
    this.personaConvenio.emit(
      {
        curp: this.personaForm.get('curp')?.value,
        rfc: this.personaForm.get('rfc')?.value,
        matricula: this.personaForm.get('matricula')?.value,
        nombre: this.personaForm.get('nombre')?.value,
        primerApellido: this.personaForm.get('primerApellido')?.value,
        segundoApellido: this.personaForm.get('segundoApellido')?.value,
        fechaNacimiento: this.personaForm.get('fechaNacimiento')?.value,
        sexo: this.personaForm.get('sexo')?.value,
        nacionalidad: this.personaForm.get('nacionalidad')?.value,
        lugarNacimiento: this.personaForm.get('lugarNacimiento')?.value,
        correoElectronico: this.personaForm.get('correoElectronico')?.value,
        telefono: this.personaForm.get('telefono')?.value,
        calle: this.personaForm.get('calle')?.value,
        noExterior: this.personaForm.get('noExterior')?.value,
        noInterior: this.personaForm.get('noInterior')?.value,
        cp: this.personaForm.get('cp')?.value,
        colonia: this.personaForm.get('colonia')?.value,
        municipio: this.personaForm.get('municipio')?.value,
        estado: this.personaForm.get('estado')?.value,
        tipoPaquete: this.personaForm.get('tipoPaquete')?.value,
        enfermedadPrexistente: this.personaForm.get('enfermedadPrexistente')?.value,
        descEnfermedadPrexistente: this.personaForm.get('descEnfermedadPrexistente')?.value,
        beneficiario: this.beneficiario
      }
    );
  }


  siguiente(): void {
    this.indice++;
  }

  regresar(): void {
    this.indice--;
  }

  cancelar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  get fp() {
    return this.personaForm.controls;
  }
}
