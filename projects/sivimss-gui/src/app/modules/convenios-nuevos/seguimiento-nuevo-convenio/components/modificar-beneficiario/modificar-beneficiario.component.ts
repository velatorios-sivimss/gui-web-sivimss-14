import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {CATALOGOS_DUMMIES} from '../../../../inventario-vehicular/constants/dummies';
import {Beneficiarios} from '../../models/beneficiarios.interface';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {DynamicDialogRef} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modificar-beneficiario',
  templateUrl: './modificar-beneficiario.component.html',
  styleUrls: ['./modificar-beneficiario.component.scss']
})
export class ModificarBeneficiarioComponent {

  modificarBeneficiarioForm!: FormGroup;
  ventanaConfirmacion: boolean = false;
  beneficiarios: Beneficiarios = {};

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  claveSAT: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
  ) {
  }

  inicializarModificarArticuloForm(): void {
    this.modificarBeneficiarioForm = this.formBuilder.group({
      edad: [{value: null, disabled: false}, [Validators.required]],
      parentesco: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      fecha: [{value: null, disabled: false}, [Validators.required]],
      curp: [{value: null, disabled: false}, [Validators.required]],
      rfc: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required]],
      telefono: [{value: null, disabled: false}, [Validators.required]],
      nombre: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  get fmb() {
    return this.modificarBeneficiarioForm.controls;
  }

  confirmarModificarBeneficiario(): void {
    this.ventanaConfirmacion = true;
    this.beneficiarios = {
      edad: this.modificarBeneficiarioForm.get("edad")?.value,
      parentesco: this.modificarBeneficiarioForm.get("parentesco")?.value,
      velatorio: this.modificarBeneficiarioForm.get("velatorio")?.value,
      fecha: this.modificarBeneficiarioForm.get("fecha")?.value,
      curp: this.modificarBeneficiarioForm.get("curp")?.value,
      rfc: this.modificarBeneficiarioForm.get("rfc")?.value,
      correoElectronico: this.modificarBeneficiarioForm.get("correoElectronico")?.value,
      telefono: this.modificarBeneficiarioForm.get("telefono")?.value,
      nombre: this.modificarBeneficiarioForm.get("nombre")?.value,
    };
  }

  cerrar(): void {
    //   if(event && event.origen == "modificar"){
    //     this.ventanaConfirmacion = false;
    //     this.ref.close(true);
    //     return;
    //   }

    //   if(event && event.origen == "regresar") {
    //     this.ventanaConfirmacion = false;
    //     return;
    //   }

    //   if(event && event.origen == "cancelar"){
    //     this.ventanaConfirmacion = false;
    //     return;
    //   }
    //   this.ref.close(false);
  }


}
