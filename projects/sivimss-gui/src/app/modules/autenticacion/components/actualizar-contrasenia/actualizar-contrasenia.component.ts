import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRespuesta } from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { finalize } from "rxjs/operators";
import { PATRON_CONTRASENIA } from "../../../../utils/regex";
import { MensajesRespuestaAutenticacion } from "../../../../utils/mensajes-respuesta-autenticacion.enum";

/**
 * Valida que la contraseña anterior sea diferente a la nueva
 */
export function contraseniasDiferentesdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const contraseniaAnterior = control.get('contraseniaAnterior');
    const contraseniaNueva = control.get('contraseniaNueva');
    return contraseniaAnterior && contraseniaNueva && contraseniaAnterior.value !== contraseniaNueva.value ? null : { contraseniasIguales: true };
  };
}

/**
 * Valida que la contraseña nueva y la confirmacion de la nueva contraseña sean iguales.
 */
export const confirmacionContraseniadValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const contraseniaNueva = control.get('contraseniaNueva');
  const contraseniaConfirmacion = control.get('contraseniaConfirmacion');
  return contraseniaNueva && contraseniaConfirmacion && contraseniaNueva.value === contraseniaConfirmacion.value ? null : { contraseniasDiferentes: true };
};

/**
 * Valida que los correos introducidos del contratante sean iguales.
 */
export const confirmacionCorreoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const correo = control.get('datosGenerales')?.get('correo');
  const correoConfirmacion = control.get('datosGenerales')?.get('correoConfirmacion');
  if (correo?.value && correoConfirmacion?.value) {
    return correo && correoConfirmacion && correo.value === correoConfirmacion.value ? null : { correosDiferentes: true };
  } else {
    return null;  
  }
};

@Component({
  selector: 'app-actualizar-contrasenia',
  templateUrl: './actualizar-contrasenia.component.html',
  styleUrls: ['./actualizar-contrasenia.component.scss']
})
export class ActualizarContraseniaComponent implements OnInit {

  readonly SEGUNDOS_TEMPORIZADOR_INTENTOS: number = 300;

  minutosTemporizadorIntentos: string = '';
  segundosTemporizadorIntentos: string = '';

  form!: FormGroup;
  private readonly contraseniaAnterior: string = '';
  mostrarModalFormatoContrasenia: boolean = false;
  mostrarModalIntentosFallidos: boolean = false;

  usuarioIncorrecto: boolean = false;
  contraseniaIncorrecta: boolean = false;

  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      usuario: ['', Validators.required],
      contraseniaAnterior: ['', Validators.required],
      contraseniaNueva: new FormControl('', Validators.compose([Validators.required, Validators.pattern(PATRON_CONTRASENIA)])),
      contraseniaConfirmacion: ['', Validators.required]
    },
      {
        validators: [
          contraseniasDiferentesdValidator(),
          confirmacionContraseniadValidator
        ]
      }
    );
  }


  actualizarContrasenia(): void {
    if (this.form.invalid) {
      return;
    }
    const {
      usuario,
      contraseniaAnterior,
      contraseniaNueva
    } = this.form.value;
    this.usuarioIncorrecto = false;
    this.loaderService.activar();
    this.autenticacionService.actualizarContrasenia(usuario, contraseniaAnterior, contraseniaNueva).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<unknown>): void => {
        if (respuesta.error) {
          this.procesarRespuesta(respuesta.mensaje);
          return;
        }
        this.alertaService.mostrar(TipoAlerta.Exito, 'Contraseña actualizada correctamente.');
        void this.router.navigate(["../"], { relativeTo: this.activatedRoute });
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    });
  }

  procesarRespuesta(respuesta: string): void {
    switch (respuesta) {
      case MensajesRespuestaAutenticacion.CredencialesIncorrectas:
        this.form.get('contraseniaAnterior')?.reset();
        this.contraseniaIncorrecta = !this.contraseniaIncorrecta;
        break;
      case MensajesRespuestaAutenticacion.UsuarioNoExiste:
        this.form.get('usuario')?.reset();
        this.form.get('contraseniaAnterior')?.reset();
        this.usuarioIncorrecto = !this.usuarioIncorrecto;
        break;
      case MensajesRespuestaAutenticacion.CantidadMaximaIntentosFallidos:
        this.mostrarModalIntentosFallidos = true;
        this.empezarTemporizadorPorExcederIntentos();
        break;
    }
  }

  validarContrasenia(): void {
    if (!this.form.controls.contraseniaNueva?.errors?.pattern) return;
    this.mostrarModalFormatoContrasenia = !this.mostrarModalFormatoContrasenia;
  }

  restablecerCampos(): void {
    this.form.get('contraseniaNueva')?.patchValue(null);
    this.form.get('contraseniaConfirmacion')?.patchValue(null);
    this.mostrarModalFormatoContrasenia = !this.mostrarModalFormatoContrasenia;
  }

  empezarTemporizadorPorExcederIntentos(): void {
    let duracionEnSegundos: number = this.existeTemporizadorEnCurso() ? Number(localStorage.getItem('segundos_temporizador_intentos_sivimss')) : this.SEGUNDOS_TEMPORIZADOR_INTENTOS;
    let refTemporador: NodeJS.Timer = setInterval((): void => {
      let minutos: string | number = Math.floor(duracionEnSegundos / 60);
      let segundos: string | number = duracionEnSegundos % 60;
      minutos = minutos < 10 ? '0' + minutos : minutos;
      segundos = segundos < 10 ? '0' + segundos : segundos;
      this.minutosTemporizadorIntentos = minutos as string;
      this.segundosTemporizadorIntentos = segundos as string;
      duracionEnSegundos--;
      localStorage.setItem('segundos_temporizador_intentos_sivimss', String(duracionEnSegundos));
      if (duracionEnSegundos < 0) {
        clearInterval(refTemporador);
        localStorage.removeItem('segundos_temporizador_intentos_sivimss');
        this.mostrarModalIntentosFallidos = false;
      }
    }, 1000);
  }

  existeTemporizadorEnCurso(): boolean {
    return localStorage.getItem('segundos_temporizador_intentos_sivimss') !== null;
  }

  get f() {
    return this.form.controls;
  }

}
