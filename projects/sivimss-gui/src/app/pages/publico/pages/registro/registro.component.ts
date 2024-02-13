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
import { IContratanteRegistrado, IRegistrarContratante } from './models/registro-contratante.interface';
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

  mostrarMensajeError: boolean = false;
  mensajeError: string = '';
  idUsuario?: number | null;
  idContratante?: number | null;
  idPersona?: number | null;
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
          [Validators.required],
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

  obtenerCP(coloniaSeleccionada?: string | undefined): void {
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
        if (respuesta.datos && respuesta.datos.length > 0) {
          this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
          this.domicilio.estado.setValue(respuesta.datos[0].municipio.entidadFederativa.nombre);
          this.domicilio.municipio.setValue(respuesta.datos[0].municipio.nombre);
          this.domicilio.colonia.markAsTouched();
          if (coloniaSeleccionada) {
            this.colonias.forEach((item: TipoDropdown) => {
              if (item.label === coloniaSeleccionada) {
                this.domicilio.colonia.setValue(item.value);
              }
            });
          }
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
      this.ajustarForm();
      if (this.datosGenerales.curp.value !== '' && this.datosGenerales.curp.value !== null) {
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
      }
    } else {
      this.registroService.validarCurpRfc({ rfc: null, curp: this.datosGenerales.curp.value }).subscribe({
        next: (respuesta: HttpRespuesta<IContratanteRegistrado[] | any>) => {
          this.datosGenerales.curp.setErrors({ 'incorrect': true });
          if (respuesta.mensaje === 'EXITO') {
            this.datosGenerales.curp.setErrors(null);
            const datosUsuario = respuesta.datos;
            const [dia, mes, anio] = datosUsuario.fechNac.split('-');
            const fecha = new Date(anio + '/' + mes + '/' + dia);
            this.datosGenerales.nombre.setValue(datosUsuario.nombre)
            this.datosGenerales.primerApellido.setValue(datosUsuario.apellido1)
            this.datosGenerales.segundoApellido.setValue(datosUsuario.apellido2)
            this.datosGenerales.sexo.setValue(datosUsuario.sexo === "MUJER" ? 1 : 2)
            this.datosGenerales.fechaNacimiento.setValue(fecha);
            this.idUsuario = null;
            this.idContratante = null;
            this.idPersona = null;
          } else if (respuesta.mensaje === 'USUARIO REGISTRADO') {
            this.datosGenerales.curp.setErrors(null);
            const datosUsuario = respuesta.datos[0];
            // Si idUsuario es null solo falta crear el usuario - Se debe pre-llenar formulario
            this.datosGenerales.curp.setValue(datosUsuario.curp);
            this.datosGenerales.nss.setValue(datosUsuario.nss);
            this.datosGenerales.rfc.setValue(datosUsuario.rfc);
            this.datosGenerales.nombre.setValue(datosUsuario.nomPersona);
            this.datosGenerales.primerApellido.setValue(datosUsuario.paterno);
            this.datosGenerales.segundoApellido.setValue(datosUsuario.materno);
            this.datosGenerales.fechaNacimiento.setValue(datosUsuario.fecNacimiento);
            this.datosGenerales.sexo.setValue(datosUsuario.idSexo);
            this.datosGenerales.otro.setValue(datosUsuario.otroSexo);
            this.datosGenerales.nacionalidad.setValue(datosUsuario.idPais === 119 ? 1 : 2);
            this.datosGenerales.paisNacimiento.setValue(datosUsuario.idPais);
            this.datosGenerales.lugarNacimiento.setValue(datosUsuario.idLugarNac);
            this.datosGenerales.telefono.setValue(datosUsuario.tel);
            this.datosGenerales.correo.setValue(datosUsuario.correo);
            this.datosGenerales.correoConfirmacion.setValue(datosUsuario.correo);

            this.domicilio.calle.setValue(datosUsuario.calle);
            this.domicilio.numeroInterior.setValue(datosUsuario.numInt);
            this.domicilio.numeroExterior.setValue(datosUsuario.numExt);
            this.domicilio.codigoPostal.setValue(datosUsuario.cp);
            this.obtenerCP(datosUsuario.colonia);
            this.idUsuario = datosUsuario?.idUsuario ?? null;
            this.idContratante = datosUsuario?.idContratante;
            this.idPersona = datosUsuario?.idPersona;

            this.form.disable();
            this.datosGenerales.curp.enable();
          } else if (respuesta.mensaje === 'NO EXISTE CURP') {
            this.ajustarForm();
            this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          } else {
            this.ajustarForm();
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
      this.form.reset();
      this.form.enable();
      this.domicilio.municipio.disable();
      this.domicilio.estado.disable();
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
              const datosUsuario = respuesta.datos[0];
              // Si idUsuario es null solo falta crear el usuario - Se debe pre-llenar formulario
              this.datosGenerales.curp.setValue(datosUsuario.curp);
              this.datosGenerales.nss.setValue(datosUsuario.nss);
              this.datosGenerales.rfc.setValue(datosUsuario.rfc);
              this.datosGenerales.nombre.setValue(datosUsuario.nomPersona);
              this.datosGenerales.primerApellido.setValue(datosUsuario.paterno);
              this.datosGenerales.segundoApellido.setValue(datosUsuario.materno);
              this.datosGenerales.fechaNacimiento.setValue(datosUsuario.fecNacimiento);
              this.datosGenerales.sexo.setValue(datosUsuario.idSexo);
              this.datosGenerales.otro.setValue(datosUsuario.otroSexo);
              this.datosGenerales.nacionalidad.setValue(datosUsuario.idPais === 119 ? 1 : 2);
              this.datosGenerales.paisNacimiento.setValue(datosUsuario.idPais);
              this.datosGenerales.lugarNacimiento.setValue(datosUsuario.idLugarNac);
              this.datosGenerales.telefono.setValue(datosUsuario.tel);
              this.datosGenerales.correo.setValue(datosUsuario.correo);
              this.datosGenerales.correoConfirmacion.setValue(datosUsuario.correo);

              this.domicilio.calle.setValue(datosUsuario.calle);
              this.domicilio.numeroInterior.setValue(datosUsuario.numInt);
              this.domicilio.numeroExterior.setValue(datosUsuario.numExt);
              this.domicilio.codigoPostal.setValue(datosUsuario.cp);
              this.obtenerCP(datosUsuario.colonia);
              this.idUsuario = datosUsuario?.idUsuario ?? null;
              this.idContratante = datosUsuario?.idContratante;
              this.idPersona = datosUsuario?.idPersona;

              this.form.disable();
              this.datosGenerales.rfc.enable();
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
          this.mostrarMensajeError = true;
          this.mensajeError = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosGuardar(): IRegistrarContratante {
    return {
      idUsuario: this.idUsuario,
      nombre: this.datosGenerales.nombre.value,
      paterno: this.datosGenerales.primerApellido.value,
      materno: this.datosGenerales.segundoApellido.value,
      rfc: this.datosGenerales.rfc.value,
      curp: this.datosGenerales.curp.value,
      numSexo: this.datosGenerales.sexo.value,
      otroSexo: this.datosGenerales.otro.value,
      nss: this.datosGenerales.nss.value,
      fecNacimiento: typeof this.datosGenerales.fechaNacimiento.value === 'object' ?
        moment(this.datosGenerales.fechaNacimiento.value).format('DD-MM-YYYY') :
        moment(this.datosGenerales.fechaNacimiento.value, 'DD/MM/YYYY').format('DD-MM-YYYY'),
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
        idPersona: this.idPersona,
        idContratante: this.idContratante,
        matricula: null,
      },
    }
  }

  ajustarForm() {
    const curp = this.datosGenerales.curp.value;
    this.form.reset();
    this.form.enable();
    this.datosGenerales.curp.setValue(curp);
    this.domicilio.municipio.disable();
    this.domicilio.estado.disable();
  }


  get datosGenerales() {
    return (this.form.controls['datosGenerales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.form.controls['domicilio'] as FormGroup).controls;
  }
}
