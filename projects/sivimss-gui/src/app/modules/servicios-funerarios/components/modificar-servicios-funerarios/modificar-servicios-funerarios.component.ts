import { Component, OnInit } from '@angular/core';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios/constants/dummies";

@Component({
  selector: 'app-modificar-servicios-funerarios',
  templateUrl: './modificar-servicios-funerarios.component.html',
  styleUrls: ['./modificar-servicios-funerarios.component.scss']
})
export class ModificarServiciosFunerariosComponent implements OnInit {

  indice: number = 0;
  menuStep: MenuItem[] = MENU_STEPPER;

  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  nacionalidad: TipoDropdown[] = CATALOGOS_DUMMIES;
  sexo: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;
  numeroPago: TipoDropdown[] = CATALOGOS_DUMMIES;

  datosAfiliadoForm!: FormGroup;
  datosContratanteForm!: FormGroup;

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
      curp: [{value: "LAHJ07087067L", disabled:false},[Validators.required]],
      rfc: [{value: "LAHJ07087067LCDNNHDF", disabled:false},[Validators.required]],
      matricula: [{value: "0192837465", disabled:false},[Validators.required]],
      nss: [{value: "456356254726211", disabled:false},[Validators.required]],
      nombre: [{value: "José", disabled:false},[Validators.required]],
      primerApellido: [{value: "Lara", disabled:false},[Validators.required]],
      segundoApellido: [{value: "Hernández", disabled:false},[Validators.required]],
      sexo: [{value: 1, disabled:false},[Validators.required]],
      fechaNacimiento: [{value: "01/01/1965", disabled:false},[Validators.required]],
      nacionalidad: [{value: 1, disabled:false},[Validators.required]],
      lugarNacimiento: [{value: "NA", disabled:false},[Validators.required]],
      telefono: [{value: "5546372819", disabled:false},[Validators.required]],
      correoElectronico: [{value: "larajohe3452@gmail.com", disabled:false},[Validators.required]],
      cp: [{value: "00666", disabled:false},[Validators.required]],
      calle: [{value: "Avenida Médicos Militares", disabled:false},[Validators.required]],
      numeroInterior: [{value: null, disabled:false},[Validators.required]],
      numeroExterior: [{value: "23", disabled:false},[Validators.required]],
      colonia: [{value: "Del fuerte Lopez Lopes", disabled:false},[Validators.required]],
      municipio: [{value: "Santiago de Querétaro", disabled:false},[Validators.required]],
      estado: [{value: 1, disabled:false},[Validators.required]],
      tipoPaquete: [{value: "ZAVNU010175HDFNCD00", disabled:false},[Validators.required]],
      numeroPago: [{value: 1, disabled:false},[Validators.required]],
    });
  }

  inicializarFormDatosContratante(): void {
    this.datosContratanteForm = this.formBuilder.group({
      datosIguales: [{value: false, disabled:false},[Validators.required]],
      curp: [{value: "ZAVNU010178HDFNCD00", disabled:false},[Validators.required]],
      rfc: [{value: "456356254726511", disabled:false},[Validators.required]],
      matricula: [{value: "0192837465", disabled:false},[Validators.required]],
      nss: [{value: "45356254726511", disabled:false},[Validators.required]],
      nombre: [{value: "Nuria Jimena", disabled:false},[Validators.required]],
      primerApellido: [{value: "Hernández", disabled:false},[Validators.required]],
      segundoApellido: [{value: "Nido", disabled:false},[Validators.required]],
      sexo: [{value: 2, disabled:false},[Validators.required]],
      fechaNacimiento: [{value: "01/01/1965", disabled:false},[Validators.required]],
      nacionalidad: [{value: 1, disabled:false},[Validators.required]],
      lugarNacimiento: [{value: "NA", disabled:false},[Validators.required]],
      telefono: [{value: "5546372819", disabled:false},[Validators.required]],
      correoElectronico: [{value: "nurialachiquis102938@gmail.com", disabled:false},[Validators.required]],
      cp: [{value: "00666", disabled:false},[Validators.required]],
      calle: [{value: "Avenida Médicos Militares", disabled:false},[Validators.required]],
      numeroInterior: [{value: null, disabled:false},[Validators.required]],
      numeroExterior: [{value: "23", disabled:false},[Validators.required]],
      colonia: [{value: "Del fuerte Lopez Lopes", disabled:false},[Validators.required]],
      municipio: [{value: "Santiago de Querétaro", disabled:false},[Validators.required]],
      estado: [{value: 2, disabled:false},[Validators.required]],
    });
  }

  aceptar(): void {
    if(this.indice == this.menuStep.length){
      this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA modificado correctamente');
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
