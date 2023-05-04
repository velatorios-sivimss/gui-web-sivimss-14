import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OverlayPanel } from "primeng-lts/overlaypanel";
import { Funcionalidad } from "projects/sivimss-gui/src/app/modules/roles/models/funcionalidad.interface";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS} from '../../../usuarios/constants/catalogos_dummies';
import {ValeParitaria} from "../../models/vale-paritaria.interface";
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';


@Component({
  selector: 'app-modificar-credito',
  templateUrl: './modificar-credito.component.html',
  styleUrls: ['./modificar-credito.component.scss']
})
export class ModificarCreditoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  opciones: TipoDropdown[] = CATALOGOS;
  actualizarCreditoForm!: FormGroup;
  contadorFuncionalidades = 1;
  datosValidar: any[]=[];
  datosSolicitudCredito: any[]=[];
  
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
    this.inicializarActualizarForm();
  }

  inicializarActualizarForm(): void {
    this.actualizarCreditoForm = this.formBuilder.group({
      matricula: [{value: 1234567, disabled: true}],
      nombre: [{value: "Velatorio No. 14 San Luis Potosi y CD Valles", disabled: true}],
      delegacion: [{value: null, disabled: true}],
      capacidad: [{value: true, disabled: true}],
      importe: [{value: "Activo", disabled: true}],
      formaRecuperacion: [{value: "Base", disabled: true}],
      quincenaMes: [{value: null, disabled: true}],
      importeDesc: [{value: null, disabled: true}],
      numCredito: [{value: null, disabled: true}],
      numFolio: [{value: null, disabled: true}],
      estatusCredi: [{value: null, disabled: true}],
      fcertificacion: [{value: null, disabled: true}],
      proveedor: [{value: null, disabled: false}, [Validators.required]],
      velatoriosFibeso: [{value: null, disabled: false}, [Validators.required]], 
      importeEjerc: [{value: null, disabled: false}, [Validators.required]], 
      importeLetra: [{value: null, disabled: false}, [Validators.required]], 
      respUnidad: [{value: null, disabled: false}, [Validators.required]], 
      velatorio: [{value: null, disabled: false}, [Validators.required]], 
      servicio: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  datosActualizarCredito(): any {
    return {
      matricula: this.actualizarCreditoForm.get("matricula")?.value,
      nombre: this.actualizarCreditoForm.get("nombre")?.value,
      delegacion: this.actualizarCreditoForm.get("delegacion")?.value,
      capacidad: this.actualizarCreditoForm.get("capacidad")?.value,
      importe: this.actualizarCreditoForm.get("importe")?.value,
      formaRecuperacion: this.actualizarCreditoForm.get("formaRecuperacion")?.value,
      quincenaMes: this.actualizarCreditoForm.get("quincenaMes")?.value,
      importeDesc: this.actualizarCreditoForm.get("importeDesc")?.value,
      numCredito: this.actualizarCreditoForm.get("numCredito")?.value,
      numFolio: this.actualizarCreditoForm.get("numFolio")?.value,
      estatusCredi: this.actualizarCreditoForm.get("estatusCredi")?.value,
      fcertificacion: this.actualizarCreditoForm.get("fcertificacion")?.value,
      proveedor: this.actualizarCreditoForm.get("proveedor")?.value,
      velatoriosFibeso: this.actualizarCreditoForm.get("velatoriosFibeso")?.value,
      importeEjerc: this.actualizarCreditoForm.get("importeEjerc")?.value,
      importeLetra: this.actualizarCreditoForm.get("importeLetra")?.value,
      respUnidad: this.actualizarCreditoForm.get("respUnidad")?.value,
      velatorio: this.actualizarCreditoForm.get("velatorio")?.value,
      servicio: this.actualizarCreditoForm.get("servicio")?.value,
    }
  }
  
  actualizarCredito(): void {
    this.datosSolicitudCredito = this.datosActualizarCredito();
  }


   get f() {
    return this.actualizarCreditoForm.controls;
  }
  
}
