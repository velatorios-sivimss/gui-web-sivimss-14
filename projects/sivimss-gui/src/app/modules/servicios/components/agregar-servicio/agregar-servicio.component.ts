import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";

import {Servicio,ConfirmacionServicio} from "../../models/servicio.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

import {CATALOGOS_DUMMIES} from "../../constants/dummies";

@Component({
  selector: 'app-modal-agregar-servicio',
  templateUrl: './agregar-servicio.component.html',
  styleUrls: ['./agregar-servicio.component.scss'],
  providers: [DialogService]
})
export class AgregarServicioComponent implements OnInit {

  agregarServicioForm!: FormGroup;

  servicio:Servicio = {};

  ventanaConfirmacion: boolean = false;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  claveSAT: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.inicializarAgregarServicioForm();
  }

  inicializarAgregarServicioForm():void{
    this.agregarServicioForm = this.formBuilder.group({
      id: [{value:null, disabled:true}],
      servicio: [{value:null,disabled:false},[Validators.required]],
      descripcion: [{value:null,disabled:false},[Validators.required]],
      tipoServicio: [{value:null,disabled:false},[Validators.required]],
      partidaPresupuestal: [{value:null,disabled:false},[Validators.required]],
      cuentaContable: [{value:null,disabled:false},[Validators.required]],
      observaciones: [{value:null,disabled:false},[Validators.required]],
      estatus: [{value:true,disabled:false},[Validators.required]],
      claveSAT: [{value:null,disabled:false},[Validators.required]],
    });
  }

  confirmarAgregarServicio(): void {
    this.ventanaConfirmacion = true;

    this.servicio = {
      // id: this.agregarServicioForm.get("id")?.value,
      // servicio: this.agregarServicioForm.get("servicio")?.value,
      // descripcionServicio:this.agregarServicioForm.get("descripcion")?.value,
      // tipoServicio: this.agregarServicioForm.get("tipoServicio")?.value,
      // descTipoServicio: "Campo dummy",
      // partidaPresupuestal: this.agregarServicioForm.get("partidaPresupuestal")?.value,
      // descPartidaPresupuestal: "Campo dummy",
      // cuentaContable: this.agregarServicioForm.get("cuentaContable")?.value,
      // descCuentaContable: "Campo dummy",
      // observaciones: this.agregarServicioForm.get("observaciones")?.value,
      // estatus: this.agregarServicioForm.get("estatus")?.value,
      // claveSAT:this.agregarServicioForm.get("claveSAT")?.value
      ...this.agregarServicioForm.value
    };
  }

  cerrar(event?:ConfirmacionServicio): void {
    //Selección cancelar pantalla agregar
    if(event && event.origen == "agregar"){
      this.ventanaConfirmacion = false;
      this.ref.close(true);
      return;
    }

    if(event && event.origen == "regresar") {
      this.ventanaConfirmacion = false;
      return;
    }

    if(event && event.origen == "cancelar"){
      this.ventanaConfirmacion = false;
      return;
    }

    this.ref.close(false);

  }

  get fas(){
    return this.agregarServicioForm.controls;
  }
}
