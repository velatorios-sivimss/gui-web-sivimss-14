import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertaService } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS} from '../../../usuarios/constants/catalogos_dummies';
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-solicitar-vale-paritaria',
  templateUrl: './solicitar-vale-paritaria.component.html',
  styleUrls: ['./solicitar-vale-paritaria.component.scss']
})
export class SolicitarValeParitariaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  opciones: TipoDropdown[] = CATALOGOS;
  solicitarValeForm!: FormGroup;
  solicitarCreditoForm!: FormGroup;
  contadorFuncionalidades = 1;
  datosValidar: any[]=[];
  datosSolicitudCredito: any[]=[];
  abrirTabVale: boolean = true;
  disableTabVale: boolean = false;
  abrirTabCredito: boolean = false;
  disableTabCredito: boolean = true;

  formaRecuperacion: any[] = [
    {
      label: 'Quincena',
      value: 1,
    },
    {
      label: 'Mes',
      value: 2,
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(USUARIOS_BREADCRUMB);
    this.inicializarSolicitarValeForm();
    this.inicializarSolicitarCreditoForm();
  }

  inicializarSolicitarValeForm(): void {
    this.solicitarValeForm = this.formBuilder.group({
      matricula: [{value: 1234567, disabled: true}, [Validators.required]],
      delegacion: [{value: "Velatorio No. 14 San Luis Potosi y CD Valles", disabled: true}, [Validators.required]],
      fsolicitud: [{value: null, disabled: false}, [Validators.required]],
      validacion: [{value: true, disabled: true}, [Validators.required]],
      estatus: [{value: "Activo", disabled: true}, [Validators.required]],
      tipoContratacion: [{value: "Base", disabled: true}, [Validators.required]],
      clave: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
      formaRecuperacion: [{value: null, disabled: false}, [Validators.required]],
      quincenaMes: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  inicializarSolicitarCreditoForm(): void {
    this.solicitarCreditoForm = this.formBuilder.group({
      matricula: [{value: 1234567, disabled: true}, [Validators.required]],
      nombre: [{value: "Velatorio No. 14 San Luis Potosi y CD Valles", disabled: true}, [Validators.required]],
      delegacion: [{value: null, disabled: true}, [Validators.required]],
      capacidad: [{value: true, disabled: true}, [Validators.required]],
      importe: [{value: "Activo", disabled: true}, [Validators.required]],
      formaRecuperacion: [{value: "Base", disabled: true}, [Validators.required]],
      quincenaMes: [{value: null, disabled: false}, [Validators.required]],
      importeDesc: [{value: null, disabled: false}, [Validators.required]],
      numCredito: [{value: null, disabled: false}, [Validators.required]],
      numFolio: [{value: null, disabled: false}, [Validators.required]],
      estatusCredi: [{value: null, disabled: false}, [Validators.required]],
      fcertificacion: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  datosValidarSiap(): any {
    return {
      matricula: this.solicitarValeForm.get("matricula")?.value,
      delegacion: this.solicitarValeForm.get("delegacion")?.value
    }
  }

  datosSolicitarVale(): any {
    return {
      matricula: this.solicitarValeForm.get("matricula")?.value,
      delegacion: this.solicitarValeForm.get("delegacion")?.value,
      fsolicitud: this.solicitarValeForm.get("fsolicitud")?.value,
      validacion: this.solicitarValeForm.get("validacion")?.value,
      estatus: this.solicitarValeForm.get("estatus")?.value,
      tipoContratacion: this.solicitarValeForm.get("tipoContratacion")?.value,
      clave: this.solicitarValeForm.get("clave")?.value,
      importe: this.solicitarValeForm.get("importe")?.value,
      formaRecuperacion: this.solicitarValeForm.get("formaRecuperacion")?.value,
      quincenaMes: this.solicitarValeForm.get("quincenaMes")?.value,
    }
  }

  datosSolicitarCredito(): any {
    return {
      matricula: this.solicitarValeForm.get("matricula")?.value,
      nombre: this.solicitarValeForm.get("nombre")?.value,
      delegacion: this.solicitarValeForm.get("delegacion")?.value,
      capacidad: this.solicitarValeForm.get("capacidad")?.value,
      importe: this.solicitarValeForm.get("importe")?.value,
      formaRecuperacion: this.solicitarValeForm.get("formaRecuperacion")?.value,
      quincenaMes: this.solicitarValeForm.get("quincenaMes")?.value,
      clave: this.solicitarValeForm.get("clave")?.value,
      importeDesc: this.solicitarValeForm.get("importeDesc")?.value,
      numCredito: this.solicitarValeForm.get("numCredito")?.value,
      numFolio: this.solicitarValeForm.get("numFolio")?.value,
      estatusCredi: this.solicitarValeForm.get("estatusCredi")?.value,
      fcertificacion: this.solicitarValeForm.get("fcertificacion")?.value,
    }
  }


  validarSiap(): void {
    this.datosValidar = this.datosValidarSiap();
  }

  solicitarVale(): void {
    this.disableTabVale = true;
    this.abrirTabVale = false;
    this.abrirTabCredito = true;
    this.disableTabCredito = false;
  }

  solicitarCredito(): void {
    this.datosSolicitudCredito = this.datosSolicitarCredito();
  }

  get f() {
    return this.solicitarValeForm.controls;
  }

   get fc() {
    return this.solicitarCreditoForm.controls;
  }

}
