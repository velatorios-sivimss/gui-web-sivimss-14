import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UsuarioContratante} from "../../models/usuario-contratante.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";

@Component({
  selector: 'app-modificar-contratantes',
  templateUrl: './modificar-contratantes.component.html',
  styleUrls: ['./modificar-contratantes.component.scss']
})
export class ModificarContratantesComponent implements OnInit {

  @Input() contratante!: UsuarioContratante;
  @Input() origen!: string;

  contratanteModificado: UsuarioContratante = {};

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  datosGeneralesForm!: FormGroup;
  domicilioForm!: FormGroup;

  sexo: TipoDropdown[] = CATALOGOS_DUMMIES;
  nacionalidad: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    if(this.config?.data){
      this.contratante = this.config.data.contratante;
    }

    this.incializarDatosGeneralesForm(this.contratante);
    this.inicializarDomicilioForm(this.contratante);
  }

  incializarDatosGeneralesForm(contratanteSeleccionado:UsuarioContratante): void {
    this.datosGeneralesForm = this.formBuilder.group({
      curp: [{value: contratanteSeleccionado.curp, disabled: false}, [Validators.required]],
      rfc: [{value: contratanteSeleccionado.rfc, disabled: false}, [Validators.required]],
      nss: [{value: contratanteSeleccionado.nss, disabled: false}, [Validators.required]],
      nombre: [{value: contratanteSeleccionado.nombre, disabled: false}, [Validators.required]],
      primerApellido: [{value: contratanteSeleccionado.primerApellido, disabled: false}, [Validators.required]],
      segundoApellido: [{value: contratanteSeleccionado.segundoApellido, disabled: false}, [Validators.required]],
      sexo: [{value: contratanteSeleccionado.sexo, disabled: false}, [Validators.required]],
      fechaNacimiento: [{value: contratanteSeleccionado.fechaNacimiento, disabled: false}, [Validators.required]],
      nacionalidad: [{value: contratanteSeleccionado.nacionalidad, disabled: false}, [Validators.required]],
      lugarNacimiento: [{value: contratanteSeleccionado.lugarNacimiento, disabled: false}, [Validators.required]],
      telefono: [{value: contratanteSeleccionado.telefono, disabled: false}, [Validators.required]],
      correoElectronico: [{value: contratanteSeleccionado.correoElectronico, disabled: false}, [Validators.required]]
    });
  }

  inicializarDomicilioForm(contratanteSeleccionado:UsuarioContratante): void {
    this.domicilioForm = this.formBuilder.group({
      cp: [{value: contratanteSeleccionado.cp, disabled: false}, [Validators.required]],
      calle: [{value: contratanteSeleccionado.calle, disabled: false}, [Validators.required]],
      numeroExterior: [{value: contratanteSeleccionado.numeroExterior, disabled: false}, [Validators.required]],
      numeroInterior: [{value: contratanteSeleccionado.numeroInterior, disabled: false}, [Validators.required]],
      colonia: [{value: contratanteSeleccionado.colonia, disabled: false}, [Validators.required]],
      municipio: [{value: contratanteSeleccionado.municipio, disabled: false}, [Validators.required]],
      estado: [{value: contratanteSeleccionado.estado, disabled: false}, [Validators.required]],
      estatus: [{value: contratanteSeleccionado.estatus, disabled: false}, [Validators.required]],
    });
  }

  siguiente(): void {
    this.indice ++;
    if(this.indice == this.menuStep.length){
      this.crearResumenContratante();
    }
  }
  cancelar(): void {
    this.ref.close();
  }

  crearResumenContratante(): void {
    this.contratanteModificado = {
      id: null,
      ...this.datosGeneralesForm.value,
      ...this.domicilioForm.value
    }
  }

  get dgf() {
    return this.datosGeneralesForm.controls;
  }

  get df(){
    return this.domicilioForm.controls;
  }

}
