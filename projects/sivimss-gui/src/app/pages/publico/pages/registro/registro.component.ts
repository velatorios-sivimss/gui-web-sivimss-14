import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { confirmacionCorreoValidator } from 'projects/sivimss-gui/src/app/modules/autenticacion/components/actualizar-contrasenia/actualizar-contrasenia.component';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { CATALOGO_NACIONALIDAD, CATALOGO_SEXO } from "projects/sivimss-gui/src/app/modules/contratantes/constants/catalogos-complementarios";
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { RegistrarContratante } from './models/registro-contratante.interface';
import { PATRON_CURP } from 'projects/sivimss-gui/src/app/utils/constantes';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistroService } from './services/registro.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  form!: FormGroup;

  fechaActual = new Date();

  dummyDropdown: { label: string; value: number }[] = [
    { label: 'Opción 1', value: 1 },
    { label: 'Opción 2', value: 2 },
  ];

  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  catalogoEstados: TipoDropdown[] = [];
  catalogoPaises: TipoDropdown[] = [];
  colonias: TipoDropdown[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly registroService: RegistroService,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.crearForm();
    this.obtenerPaises();
    this.obtenerEstados();
    this.obtenerCP();
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
      datosGenerales: this.formBuilder.group({
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CURP)],
        ],
        nss: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-zA-Z]{2,3}')],
        ],
        correoConfirmacion: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-zA-Z]{2,3}')],
        ],
      }),
      domicilio: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.minLength(5)],
        ],
        colonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
    },
      { validators: [confirmacionCorreoValidator] }
    );
  }

  obtenerEstados() {
    this.registroService.obtenerEstados()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoEstados = mapearArregloTipoDropdown(respuesta.datos, "estado", "idEstado");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPaises() {
    this.registroService.obtenerPaises()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoPaises = mapearArregloTipoDropdown(respuesta.datos, "pais", "idPais");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  cambioTipoSexo() {
    this.datosGenerales.otro.patchValue(null);
  }

  cambioNacionalidad() {
    this.datosGenerales.paisNacimiento.patchValue(null);
    this.datosGenerales.lugarNacimiento.patchValue(null);
    if (this.datosGenerales.nacionalidad.value === 1) {
      this.datosGenerales.paisNacimiento.setValue(119);
    }
  }

  obtenerCP(): void {
    if (!this.domicilio.codigoPostal.value || this.domicilio.codigoPostal.invalid) {
      this.colonias = [];
      this.domicilio.estado.setValue(null);
      this.domicilio.municipio.setValue(null);
      this.domicilio.colonia.setValue(null);
      return
    }
    this.loaderService.activar();
    this.registroService.consutaCP(this.domicilio.codigoPostal.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta && respuesta.length > 0) {
          this.colonias = mapearArregloTipoDropdown(respuesta, 'nombre', 'nombre');
          this.domicilio.estado.setValue(respuesta[0].municipio.entidadFederativa.nombre);
          this.domicilio.municipio.setValue(respuesta[0].municipio.nombre);
          this.domicilio.colonia.markAsTouched();
        } else {
          this.colonias = [];
          this.domicilio.estado.setValue(null);
          this.domicilio.municipio.setValue(null);
          this.domicilio.colonia.markAsTouched();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  validarCurp() {
    if (this.datosGenerales.curp.invalid) {
      if (this.datosGenerales.curp.value !== '' &&
        this.datosGenerales.curp.value !== '' &&
        this.datosGenerales.curp.value !== null) {
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP no es válido.');
      }
    } else {
      this.registroService.validarCurpRfc({ rfc: null, curp: this.datosGenerales.curp.value }).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.datosGenerales.curp.setErrors({ 'incorrect': true });
          if (respuesta.mensaje === 'USUARIO REGISTRADO') {
            this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP ya se encuentra registrado.');
            this.datosGenerales.curp.patchValue(null);
            
          } else if (respuesta.mensaje === 'NO EXISTE CURP') {
            this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          } else {
            this.datosGenerales.curp.setErrors(null);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
    }
  }

  validarRfc() {
    if (this.datosGenerales.rfc.value === '' || !this.datosGenerales.rfc.value) {
      this.datosGenerales.rfc.setErrors(null);
      this.datosGenerales.rfc.clearValidators();
      this.datosGenerales.rfc.updateValueAndValidity();
    } else {
      this.datosGenerales.rfc.setValidators(Validators.maxLength(13));
      this.datosGenerales.rfc.updateValueAndValidity();
      const regex: RegExp = new RegExp(/^([A-Z,Ñ&]{3,4}(\d{2})(0[1-9]|1[0-2])(0[1-9]|1\d|2\d|3[0-1])[A-Z|\d]{3})$/);
      if (!regex.test(this.datosGenerales.rfc.value) &&
        this.datosGenerales.rfc.value !== '' &&
        this.datosGenerales.rfc.value !== null) {
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C. no válido.');
        this.datosGenerales.rfc.setErrors({ 'incorrect': true });
      } else {
        this.registroService.validarCurpRfc({ rfc: this.datosGenerales.rfc.value, curp: null }).subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            this.datosGenerales.rfc.setErrors({ 'incorrect': true });
            if (respuesta.mensaje === 'USUARIO REGISTRADO') {
              this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C ya se encuentra registrado.');
              this.datosGenerales.rfc.patchValue(null);
            } else {
              this.datosGenerales.rfc.setErrors(null);
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error("ERROR: ", error);
          }
        });
      }
    }
  }

  validarEmail() {
    if (this.datosGenerales.correo.invalid &&
      this.datosGenerales.correo.value !== '' &&
      this.datosGenerales.correo.value !== null) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Tu correo electrónico no es válido.');
    }
  }

  registrarContratante() {
    this.loaderService.activar();
    this.registroService.registrarContratante(this.datosGuardar()).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.alertaService.mostrar(TipoAlerta.Exito, "Se registró exitosamente tu cuenta.\n" + "Hemos enviado tu usuario y contraseña al correo.\n");
          void this.router.navigate(["../autenticacion/inicio-sesion"], { relativeTo: this.activatedRoute });
        } else {
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje));
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosGuardar(): RegistrarContratante {
    return {
      nombre: this.datosGenerales.nombre.value,
      paterno: this.datosGenerales.primerApellido.value,
      materno: this.datosGenerales.segundoApellido.value,
      rfc: this.datosGenerales.rfc.value,
      curp: this.datosGenerales.curp.value,
      numSexo: this.datosGenerales.sexo.value,
      otroSexo: this.datosGenerales.otro.value,
      fecNacimiento: this.datosGenerales.fechaNacimiento.value ? moment(this.datosGenerales.fechaNacimiento.value).format('DD-MM-YYYY') : null,
      idPais: this.datosGenerales.paisNacimiento.value,
      idLugarNac: this.datosGenerales.lugarNacimiento.value,
      tel: this.datosGenerales.telefono.value,
      telFijo: null,
      correo: this.datosGenerales.correo.value,
      domicilio: {
        calle: this.domicilio.calle.value,
        numInt: this.domicilio.numeroInterior.value,
        numExt: this.domicilio.numeroExterior.value,
        cp: this.domicilio.codigoPostal.value,
        colonia: this.domicilio.colonia.value,
        municipio: this.domicilio.municipio.value,
        estado: this.domicilio.estado.value,
      },
      contratante: {
        matricula: null,
      },
    }
  }

  get datosGenerales() {
    return (this.form.controls['datosGenerales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.form.controls['domicilio'] as FormGroup).controls;
  }
}
