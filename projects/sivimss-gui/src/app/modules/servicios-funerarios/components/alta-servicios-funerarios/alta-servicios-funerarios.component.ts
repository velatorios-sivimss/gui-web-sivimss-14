import { Component, OnInit } from '@angular/core';
import {SERVICIO_BREADCRUMB, SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios/constants/dummies";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";


@Component({
  selector: 'app-alta-servicios-funerarios',
  templateUrl: './alta-servicios-funerarios.component.html',
  styleUrls: ['./alta-servicios-funerarios.component.scss']
})
export class AltaServiciosFunerariosComponent implements OnInit {

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  datosAfiliadoForm!: FormGroup;
  datosContratanteForm!: FormGroup;

  sexo: TipoDropdown[] = CATALOGOS_DUMMIES;
  nacionalidad: TipoDropdown[] = CATALOGOS_DUMMIES;
  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;
  numeroPago: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.inicializarFormDatosAfiliado();
    this.inicializarFormDatosContratante();
  }

  inicializarFormDatosAfiliado(): void {
    this.datosAfiliadoForm = this.formBuilder.group({
      curp: [{value: null, disabled:false},[Validators.required]],
      rfc: [{value: null, disabled:false},[Validators.required]],
      matricula: [{value: null, disabled:false},[Validators.required]],
      nss: [{value: null, disabled:false},[Validators.required]],
      nombre: [{value: null, disabled:false},[Validators.required]],
      primerApellido: [{value: null, disabled:false},[Validators.required]],
      segundoApellido: [{value: null, disabled:false},[Validators.required]],
      sexo: [{value: null, disabled:false},[Validators.required]],
      fechaNacimiento: [{value: null, disabled:false},[Validators.required]],
      nacionalidad: [{value: null, disabled:false},[Validators.required]],
      lugarNacimiento: [{value: null, disabled:false},[Validators.required]],
      telefono: [{value: null, disabled:false},[Validators.required]],
      correoElectronico: [{value: null, disabled:false},[Validators.required]],
      cp: [{value: null, disabled:false},[Validators.required]],
      calle: [{value: null, disabled:false},[Validators.required]],
      numeroInterior: [{value: null, disabled:false},[Validators.required]],
      numeroExterior: [{value: null, disabled:false},[Validators.required]],
      colonia: [{value: null, disabled:false},[Validators.required]],
      municipio: [{value: null, disabled:false},[Validators.required]],
      estado: [{value: null, disabled:false},[Validators.required]],
      tipoPaquete: [{value: null, disabled:false},[Validators.required]],
      numeroPago: [{value: null, disabled:false},[Validators.required]],
    });
  }

  inicializarFormDatosContratante(): void {
    this.datosContratanteForm = this.formBuilder.group({
      datosIguales: [{value: null, disabled:false},[Validators.required]],
      curp: [{value: null, disabled:false},[Validators.required]],
      rfc: [{value: null, disabled:false},[Validators.required]],
      matricula: [{value: null, disabled:false},[Validators.required]],
      nss: [{value: null, disabled:false},[Validators.required]],
      nombre: [{value: null, disabled:false},[Validators.required]],
      primerApellido: [{value: null, disabled:false},[Validators.required]],
      segundoApellido: [{value: null, disabled:false},[Validators.required]],
      sexo: [{value: null, disabled:false},[Validators.required]],
      fechaNacimiento: [{value: null, disabled:false},[Validators.required]],
      nacionalidad: [{value: null, disabled:false},[Validators.required]],
      lugarNacimiento: [{value: null, disabled:false},[Validators.required]],
      telefono: [{value: null, disabled:false},[Validators.required]],
      correoElectronico: [{value: null, disabled:false},[Validators.required]],
      cp: [{value: null, disabled:false},[Validators.required]],
      calle: [{value: null, disabled:false},[Validators.required]],
      numeroInterior: [{value: null, disabled:false},[Validators.required]],
      numeroExterior: [{value: null, disabled:false},[Validators.required]],
      colonia: [{value: null, disabled:false},[Validators.required]],
      municipio: [{value: null, disabled:false},[Validators.required]],
      estado: [{value: null, disabled:false},[Validators.required]],
    });
  }

  aceptar(): void {
    if(this.indice == this.menuStep.length){
      this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA registrado correctamente');
      this.router.navigate(["servicios-funerarios"]);
      return;
    }
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  cancelar(): void {
    this.router.navigate(["servicios-funerarios"]);
  }

  get fda() {
    return this.datosAfiliadoForm.controls;
  }

  get fdc() {
    return this.datosContratanteForm.controls;
  }
}
