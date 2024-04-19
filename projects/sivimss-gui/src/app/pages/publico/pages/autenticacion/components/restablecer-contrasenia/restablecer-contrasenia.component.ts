import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {confirmacionContraseniadValidator} from '../actualizar-contrasenia/actualizar-contrasenia.component';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {AutenticacionContratanteService} from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {PATRON_CONTRASENIA} from 'projects/sivimss-gui/src/app/utils/regex';
import {MensajesRespuestaAutenticacion} from 'projects/sivimss-gui/src/app/utils/mensajes-respuesta-autenticacion.enum';
import {CookieService} from "ngx-cookie-service";

// import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';

@Component({
  selector: 'app-restablecer-contrasenia',
  templateUrl: './restablecer-contrasenia.component.html',
  styleUrls: ['./restablecer-contrasenia.component.scss'],
  providers: [CookieService]
})
export class RestablecerContraseniaComponent implements OnInit {
  readonly SEGUNDOS_TEMPORIZADOR_INTENTOS: number = 300;

  form!: FormGroup;
  mostrarModalFormatoContrasenia: boolean = false;
  usuario: string = '';
  minutosTemporizadorIntentos: string = '';
  segundosTemporizadorIntentos: string = '';
  mostrarModalIntentosFallidos: boolean = false;
  usuarioIncorrecto: boolean = false;
  contraseniaIncorrecta: boolean = false;

  constructor(
    public autenticacionContratanteService: AutenticacionContratanteService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private readonly cookieService: CookieService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.usuario = params['usuario']
    });
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group(
      {
        usuario: [{value: null, disabled: false}, [Validators.required]],
        contraseniaAnterior: [{value: null, disabled: false}],
        contraseniaNueva: [{
          value: null,
          disabled: false
        }, [Validators.required, Validators.pattern(PATRON_CONTRASENIA)]],
        contraseniaConfirmacion: [{
          value: null,
          disabled: false
        }, [Validators.required, Validators.pattern(PATRON_CONTRASENIA)]],
      },
      {validators: [confirmacionContraseniadValidator]}
    );
  }

  restablecerContrasenia(): void {
    if (this.f.contraseniaNueva.value == null ||
      this.f.contraseniaNueva.value.trim() == '' ||
      this.f.contraseniaConfirmacion.value == null ||
      this.f.contraseniaConfirmacion.value.trim() == '') {
      this.alertaService.mostrar(TipoAlerta.Error, 'Las contraseñas no pueden ir vacías.');
      this.f.contraseniaNueva.patchValue(null);
      this.f.contraseniaConfirmacion.patchValue(null);
      return;
    }
    if (
      this.form.errors?.contraseniasDiferentes &&
      this.f.contraseniaNueva.value !== null &&
      this.f.contraseniaNueva.value !== '' &&
      this.f.contraseniaConfirmacion.value !== null &&
      this.f.contraseniaConfirmacion.value !== ''
    ) {
      this.alertaService.mostrar(TipoAlerta.Error, 'Las contraseñas ingresadas no coinciden.');
      this.f.contraseniaNueva.patchValue(null);
      this.f.contraseniaConfirmacion.patchValue(null);
      return;
    }
    const form = this.form.getRawValue();
    form.contraseniaAnterior == null ? form.contraseniaAnterior = "" : form.contraseniaAnterior
    this.usuarioIncorrecto = false;
    this.loaderService.activar();
    this.autenticacionContratanteService
      .actualizarContraseniaNewLogin(form.usuario, form.contraseniaAnterior, form.contraseniaNueva)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<unknown>): void => {
          if (respuesta.error) {
            this.procesarRespuesta(respuesta.mensaje);
            return;
          }
          this.alertaService.mostrar(
            TipoAlerta.Exito,
            'Contraseña actualizada correctamente.'
          );
          void this.router.navigate(['/externo-publico/autenticacion/inicio-sesion'], {
            relativeTo: this.activatedRoute,
          });
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, 'Error al guardar la información. Intenta nuevamente.');
        },
      });
  }

  procesarRespuesta(respuesta: string): void {
    switch (respuesta) {
      case MensajesRespuestaAutenticacion.CredencialesIncorrectas:
      case MensajesRespuestaAutenticacion.CredencialesDesiguales:
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
    let duracionEnSegundos: number = this.existeTemporizadorEnCurso() ? Number(this.cookieService.get('segundos_temporizador_intentos_sivimss')) : this.SEGUNDOS_TEMPORIZADOR_INTENTOS;
    let refTemporador: NodeJS.Timer = setInterval((): void => {
      let minutos: string | number = Math.floor(duracionEnSegundos / 60);
      let segundos: string | number = duracionEnSegundos % 60;
      minutos = minutos < 10 ? '0' + minutos : minutos;
      segundos = segundos < 10 ? '0' + segundos : segundos;
      this.minutosTemporizadorIntentos = minutos as string;
      this.segundosTemporizadorIntentos = segundos as string;
      duracionEnSegundos--;
      this.cookieService.set('segundos_temporizador_intentos_sivimss', String(duracionEnSegundos));
      if (duracionEnSegundos < 0) {
        clearInterval(refTemporador);
        this.cookieService.delete('segundos_temporizador_intentos_sivimss');
        this.mostrarModalIntentosFallidos = false;
      }
    }, 1000);
  }

  existeTemporizadorEnCurso(): boolean {
    return this.cookieService.get('segundos_temporizador_intentos_sivimss') !== null;
  }

  get f() {
    return this.form.controls;
  }
}
