import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../convenios-prevision-funeraria/constants/dummies";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {AtaudDonado} from "../../models/consulta-donaciones-interface";

@Component({
  selector: 'app-agregar-ataud-donado',
  templateUrl: './agregar-ataud-donado.component.html',
  styleUrls: ['./agregar-ataud-donado.component.scss']
})
export class AgregarAtaudDonadoComponent implements OnInit {

  agregarAtaudForm!: FormGroup;
  ataudDonado: TipoDropdown[] = CATALOGOS_DUMMIES;
  ataudSeleccionado: AtaudDonado = {};

  constructor(
    private ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.inicializarAgregarAtaudForm();
  }

  inicializarAgregarAtaudForm(): void {
    this.agregarAtaudForm = this.formBuilder.group({
      ataudDonado: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  agregar(): void {
    this.ataudSeleccionado = {
      idAtaud: 1,
      material: "Madera ecológica con detalles religiosos",
      modelo: "Mod-001",
      noInventario: "019283"
    }
    this.ref.close(this.ataudSeleccionado);
  }

  cancelar(): void {

  }

  get f() {
    return this.agregarAtaudForm.controls;
  }

}
