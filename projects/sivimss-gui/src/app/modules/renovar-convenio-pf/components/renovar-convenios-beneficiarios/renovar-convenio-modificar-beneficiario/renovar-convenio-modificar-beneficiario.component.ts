import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { Beneficiario, BeneficiarioSeleccionado } from '../../../models/convenio.interface';
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from 'projects/sivimss-gui/src/app/utils/constantes';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { UsuarioService } from '../../../../usuarios/services/usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-renovar-convenio-modificar-beneficiario',
  templateUrl: './renovar-convenio-modificar-beneficiario.component.html',
  styleUrls: ['./renovar-convenio-modificar-beneficiario.component.scss']
})
export class RenovarConvenioModificarBeneficiarioComponent implements OnInit {
  @Input() beneficiarioSeleccionado!: BeneficiarioSeleccionado;

  @Input() numBeneficiario: number = 0;

  @Output() actualizarBeneficiario = new EventEmitter<Beneficiario | null>();

  readonly POSICION_PARENTESCO = 0;
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  modificarBeneficiarioForm!: FormGroup;
  catParentesco!: TipoDropdown[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.catParentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      { label: parentesco.label, value: parentesco.value })) || [];
    this.inicializarModificarBeneficiarioForm();
  }

  inicializarModificarBeneficiarioForm(): void {
    this.modificarBeneficiarioForm = this.formBuilder.group({
      nombre: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
      primerApellido: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
      segundoApellido: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
      edad: [{ value: null, disabled: false }, [Validators.maxLength(3)]],
      parentesco: [{ value: null, disabled: false }, []],
      curp: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      email: [{ value: null, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      telefono: [{ value: null, disabled: false }, [Validators.maxLength(11)]],
      actaNacimiento: [{ value: null, disabled: false }, []],
      ineBeneficiario: [{ value: null, disabled: false }, []],
      comprobanteEstudios: [{ value: null, disabled: false }, []],
      actaMatrimonio: [{ value: null, disabled: false }, []],
      declaracionConcubinato: [{ value: null, disabled: false }, []],
    });

    this.verificarActaNacimiento();

    this.modificarBeneficiarioForm.patchValue({
      ...this.beneficiarioSeleccionado,
      parentesco: this.beneficiarioSeleccionado.idParentesco,
      email: this.beneficiarioSeleccionado.correo,
      telefono: this.beneficiarioSeleccionado.tel,
      actaNacimiento: this.beneficiarioSeleccionado.indActa,
      ineBeneficiario: this.beneficiarioSeleccionado.indIne,
      comprobanteEstudios: this.beneficiarioSeleccionado.comprobEstudios,
      actaMatrimonio: this.beneficiarioSeleccionado.actaMatrimonio,
      declaracionConcubinato: this.beneficiarioSeleccionado.declaracionConcubinato,
    });
  }

  verificarActaNacimiento() {
    this.modificarBeneficiarioForm.get('edad')?.valueChanges.subscribe((value) => {
      this.mbf.actaNacimiento.setValue(false);
      this.mbf.actaNacimiento.disable();
      if (value >= 0 && value < 18) {
        this.mbf.actaNacimiento.enable();
      }
    });
  }

  cancelar() {
    this.actualizarBeneficiario.emit(null);
  }

  guardar() {
    if (this.modificarBeneficiarioForm.valid) {
      this.actualizarBeneficiario.emit(this.modificarBeneficiarioForm.value);
    } else {
      this.modificarBeneficiarioForm.markAllAsTouched();
      const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(24);
      this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
    }
  }

  validarCurpRenapo(): void {
    if (this.mbf.curp.invalid) return;
    this.loaderService.activar();
    this.usuarioService.consultarCurpRenapo(this.mbf.curp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos?.message !== '') {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          this.mbf.curp.setErrors({ 'incorrect': true });
        } else {
          this.mbf.curp.setErrors(null);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mbf.curp.setErrors({ 'incorrect': true });
      }
    });
  }

  validarRfc() {
    const regex = new RegExp(/^([A-Z,Ñ,&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-Z|\d]{3})$/);
    if (!regex.test(this.mbf.rfc.value)) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C.no válido.');
      this.mbf.rfc.setErrors({ 'incorrect': true });
    } else {
      this.mbf.rfc.setErrors(null);
    }
  }

  validarEmail() {
    if (this.mbf.email.invalid) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Tu correo electrónico no es válido.');
    }
  }

  get mbf() {
    return this.modificarBeneficiarioForm.controls;
  }
}

