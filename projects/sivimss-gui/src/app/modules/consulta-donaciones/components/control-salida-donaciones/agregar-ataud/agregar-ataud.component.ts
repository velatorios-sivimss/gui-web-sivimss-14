import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AtaudDonado} from "../../../models/consulta-donaciones-interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../../articulos/constants/dummies";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-agregar-ataud',
  templateUrl: './agregar-ataud.component.html',
  styleUrls: ['./agregar-ataud.component.scss']
})
export class AgregarAtaudComponent implements OnInit {

  formAtaud!: FormGroup;

  ataud: TipoDropdown[] = CATALOGOS_DUMMIES;

  ataudSeleccionado: AtaudDonado = {};


  constructor(
    private formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.inicializarAtaudForm();
  }

  inicializarAtaudForm(): void {
    this.formAtaud = this.formBuilder.group({
      idAtaud: [{value:null, dsabled: false}, [Validators.required]]
    });
  }

  agregar(): void {
    this.ataudSeleccionado = {
      idAtaud:1,
      material: "Cartón",
      descAtaud: "Ataúd ecológico de madera",
      modelo: "Ecológico",
      noInventario: "1234565"
    }
    this.ref.close( this.ataudSeleccionado);
  }



  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.formAtaud.controls;
  }

}
