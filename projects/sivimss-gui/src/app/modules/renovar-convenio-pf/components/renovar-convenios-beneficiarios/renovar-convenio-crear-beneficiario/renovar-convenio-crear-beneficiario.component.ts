import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { Beneficiario, BeneficiarioSeleccionado, BusquedaListBeneficiarios } from '../../../models/convenio.interface';
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from 'projects/sivimss-gui/src/app/utils/constantes';
import { UsuarioService } from '../../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import * as moment from 'moment';

@Component({
  selector: 'app-renovar-convenio-crear-beneficiario',
  templateUrl: './renovar-convenio-crear-beneficiario.component.html',
  styleUrls: ['./renovar-convenio-crear-beneficiario.component.scss']
})
export class RenovarConvenioCrearBeneficiarioComponent implements OnInit {
  @Input() beneficiarioSeleccionado!: BeneficiarioSeleccionado;

  @Input() busquedaListBeneficiarios!: BusquedaListBeneficiarios;

  @Input() numBeneficiario: number = 0;

  @Output() crearBeneficiario = new EventEmitter<Beneficiario | null>();

  readonly POSICION_PARENTESCO = 0;
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  crearBeneficiarioForm!: FormGroup;
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
    this.inicializarCrearBeneficiarioForm();
  }

  inicializarCrearBeneficiarioForm(): void {
    this.crearBeneficiarioForm = this.formBuilder.group({
      nombre: [{ value: null, disabled: true }, [Validators.maxLength(50)]],
      primerApellido: [{ value: null, disabled: true }, [Validators.maxLength(50)]],
      segundoApellido: [{ value: null, disabled: true }, [Validators.maxLength(50)]],
      fechaNac: [{ value: null, disabled: true }, []],
      edad: [{ value: null, disabled: true }, []],
      parentesco: [{ value: null, disabled: false }, [Validators.required]],
      curp: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      email: [{ value: null, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      telefono: [{ value: null, disabled: false }, [Validators.maxLength(11)]],
      actaNacimiento: [{ value: null, disabled: true }, []],
      ineBeneficiario: [{ value: null, disabled: false }, []],
      comprobanteEstudios: [{ value: null, disabled: false }, []],
      actaMatrimonio: [{ value: null, disabled: false }, []],
      declaracionConcubinato: [{ value: null, disabled: false }, []],
    });

    this.verificarActaNacimiento();
  }

  verificarActaNacimiento() {
    this.crearBeneficiarioForm.get('edad')?.valueChanges.subscribe((value) => {
      this.cbf.actaNacimiento.setValue(false);
      this.cbf.actaNacimiento.disable();
      if (value >= 0 && value < 18) {
        this.cbf.actaNacimiento.enable();
      }
    });
  }

  cancelar() {
    this.crearBeneficiario.emit(null);
  }

  guardar() {
    if (this.crearBeneficiarioForm.valid) {

      this.crearBeneficiario.emit(this.crearBeneficiarioForm.getRawValue());
    } else {
      this.crearBeneficiarioForm.markAllAsTouched();
      const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(24);
      this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
    }
  }

  validarCurpRenapo(): void {
    this.crearBeneficiarioForm.patchValue({
      nombre: null,
      primerApellido: null,
      segundoApellido: null,
      fechaNac: null,
      edad: null,
    });
    if (this.cbf.curp.invalid) return;
    this.loaderService.activar();
    this.usuarioService.consultarCurpRenapo(this.cbf.curp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos?.message !== '') {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          this.cbf.curp.setErrors({ 'incorrect': true });
        } else {
          this.cbf.curp.setErrors(null);
          this.crearBeneficiarioForm.patchValue({
            nombre: respuesta.datos?.nombre,
            primerApellido: respuesta.datos?.apellido1,
            segundoApellido: respuesta.datos?.apellido2,
            fechaNac: respuesta.datos?.fechNac,
            edad: this.calcularEdad(moment(respuesta.datos?.fechNac, 'DD/MM/YYYY').format('YYYY/MM/DD')),
          });
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.cbf.curp.setErrors({ 'incorrect': true });
      }
    });
  }

  validarRfc() {
    const regex = new RegExp(/^([A-Z,Ñ,&]{3,4}(\d{2})(0[1-9]|1[0-2])(0[1-9]|1\d|2\d|3[0-1])[A-Z|\d]{3})$/);
    if (!regex.test(this.cbf.rfc.value)) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C. no válido.');
      this.cbf.rfc.setErrors({ 'incorrect': true });
    } else {
      this.cbf.rfc.setErrors(null);
    }
  }

  validarEmail() {
    if (this.cbf.email.invalid) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Tu correo electrónico no es válido.');
    }
  }

  calcularEdad(fecha: string) {
    const hoy = new Date();
    const cumpleanos = new Date(fecha);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  }

  get cbf() {
    return this.crearBeneficiarioForm.controls;
  }
}

