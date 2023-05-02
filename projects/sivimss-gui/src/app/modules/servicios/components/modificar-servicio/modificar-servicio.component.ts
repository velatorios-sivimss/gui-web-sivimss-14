import { Component, OnInit } from '@angular/core';

import {AlertaService,TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Servicio,ConfirmacionServicio} from "../../models/servicio.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";

@Component({
  selector: 'app-modificar-servicio',
  templateUrl: './modificar-servicio.component.html',
  styleUrls: ['./modificar-servicio.component.scss']
})
export class ModificarServicioComponent implements OnInit {

  modificarServicioForm!: FormGroup;

  servicio: Servicio = {};

  ventanaConfirmacion: boolean = false;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  claveSAT: TipoDropdown[] = CATALOGOS_DUMMIES;



  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.inicializarModificarServicioForm();
  }

  inicializarModificarServicioForm(): void{
    this.modificarServicioForm = this.formBuilder.group({
      // id: [{value:null, disabled:true},[Validators.required]],
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


  get fms(){
    return this.modificarServicioForm.controls;
  }

  confirmarModificarServicio(): void{
    this.ventanaConfirmacion = true;
    this.servicio = {
      id: this.modificarServicioForm.get("id")?.value,
      servicio: this.modificarServicioForm.get("servicio")?.value,
      descripcionServicio:this.modificarServicioForm.get("descripcion")?.value,
      tipoServicio: this.modificarServicioForm.get("tipoServicio")?.value,
      descTipoServicio: "Campo dummy",
      partidaPresupuestal: this.modificarServicioForm.get("partidaPresupuestal")?.value,
      descPartidaPresupuestal: "Campo dummy",
      cuentaContable: this.modificarServicioForm.get("cuentaContable")?.value,
      descCuentaContable: "Campo dummy",
      observaciones: this.modificarServicioForm.get("observaciones")?.value,
      estatus: this.modificarServicioForm.get("estatus")?.value,
      claveSAT:this.modificarServicioForm.get("claveSAT")?.value
    };

  }

  cerrar(event?:ConfirmacionServicio):void {
    if(event && event.origen == "modificar"){
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

}
