import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {SelectButtonModule} from "primeng/selectbutton";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios-funerarios/constants/dummies";
import {RegistrarEntradaComponent} from "../registrar-entrada/registrar-entrada.component";
import {RegistrarSalidaComponent} from "../registrar-salida/registrar-salida.component";

@Component({
  selector: 'app-capilla-reservacion',
  templateUrl: './capilla-reservacion.component.html',
  styleUrls: ['./capilla-reservacion.component.scss'],
  providers: [DialogService]
})
export class CapillaReservacionComponent implements OnInit {



  registrarEntradaForm!: FormGroup;
  registrarSalidaForm!: FormGroup;
  calendarioForm!: FormGroup;


  agregarEntradaRef!: DynamicDialogRef;
  agregarSalidaRef!: DynamicDialogRef;

  opciones: SelectButtonModule[] = [
    {icon: 'pi pi-align-left' , value: '0'},
    {icon: 'pi pi-align-left', value: '1'}
  ];


  value: number = 0;

  velatorio:TipoDropdown[] = CATALOGOS_DUMMIES;
  capilla:TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarRegistroEntradaForm();
    this.inicializarRegistroSalidaForm();
    this.inicializarCalendarioForm();
  }

  actualizarBreadcrumb(): void{
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarRegistroEntradaForm(): void {
    this.registrarEntradaForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}],
      fechaEntrada: [{value: null, disabled: false}, [Validators.required]],
      horaEntrada: [{value: null, disabled: false}, [Validators.required]],
    })
  }

  inicializarRegistroSalidaForm(): void {
    this.registrarSalidaForm = this.formBuilder.group({
      capilla: [{value: null, disabled: false}],
      fechaSalida: [{value: null, disabled: false}, [Validators.required]],
      horaSalida: [{value: null, disabled: false}, [Validators.required]],
    })
  }

  inicializarCalendarioForm(): void {
    this.calendarioForm = this.formBuilder.group( {
      velatorio: [{value: null, disabled: false}],
    });
  }

  abrirModalAgregarEntrada(): void {
    this.agregarEntradaRef = this.dialogService.open(RegistrarEntradaComponent,{
      header: "Registrar entrada",
      width: "920px",
      });
  }

  abrirModalAgregarSalida(): void {
    this.agregarSalidaRef = this.dialogService.open(RegistrarSalidaComponent,{
      header: 'Registrar salida',
      width: "920px",
    });
  }

  get fe() {
    return this.registrarEntradaForm.controls;
  }

  get fs() {
    return this.registrarSalidaForm.controls;
  }


}
