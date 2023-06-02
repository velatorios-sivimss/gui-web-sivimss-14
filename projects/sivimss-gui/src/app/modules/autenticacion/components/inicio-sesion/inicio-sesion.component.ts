import {HttpErrorResponse} from "@angular/common/http";
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from "primeng/dynamicdialog";
import {
  ModalRestablecerContraseniaComponent
} from "projects/sivimss-gui/src/app/modules/autenticacion/components/modal-restablecer-contrasenia/modal-restablecer-contrasenia.component";
import {LoaderService} from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import {AutenticacionService} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {MensajesRespuestaAutenticacion} from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-autenticacion.enum";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.scss']
})
export class InicioSesionComponent implements OnInit, OnDestroy {

  readonly NO_MOSTRAR_MSJ_CONTRASENIA_PROX_VENCER: boolean = false;
  readonly SEGUNDOS_TEMPORIZADOR_INTENTOS: number = 300;

  minutosTemporizadorIntentos: string = '';
  segundosTemporizadorIntentos: string = '';
  refTemporizador: any;

  form!: FormGroup;

  mostrarModalPreActivo: boolean = false;
  mostrarModalContraseniaProxVencer: boolean = false;
  mostrarModalFechaContraseniaVencida: boolean = false;
  mostrarModalIntentosFallidos: boolean = false;
  mostrarModalCuentaBloqueada: boolean = false;
  mostrarModalUsuarioNoExiste = false;
  mostrarModalSIAPSinConexion = false;
  mostrarModalSIAPDesactivado = false;
  usuarioIncorrecto: boolean = false;
  contraseniaIncorrecta: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private readonly autenticacionService: AutenticacionService,
    private readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  acceder(mostrarMsjContraseniaProxVencer: boolean = true): void {
    if (this.form.invalid) {
      return;
    }
    const {usuario, contrasenia} = this.form.value;
    this.loaderService.activar();
    this.usuarioIncorrecto = false;
    this.autenticacionService.iniciarSesion(usuario, contrasenia, mostrarMsjContraseniaProxVencer)
      .pipe(
        finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: string): void => {
        switch (respuesta) {
          case MensajesRespuestaAutenticacion.InicioSesionCorrecto:
            void this.router.navigate(["/inicio"]);
            break;
          case MensajesRespuestaAutenticacion.ContraseniaProximaVencer:
            this.mostrarModalContraseniaProxVencer = true;
            break;
          case MensajesRespuestaAutenticacion.CredencialesIncorrectas:
            this.form.get('contrasenia')?.reset();
            this.contraseniaIncorrecta = !this.contraseniaIncorrecta;
            break;
          case MensajesRespuestaAutenticacion.CantidadMaximaIntentosFallidos:
            this.mostrarModalIntentosFallidos = true;
            this.empezarTemporizadorPorExcederIntentos();
            break;
          case MensajesRespuestaAutenticacion.FechaContraseniaVencida:
            this.mostrarModalFechaContraseniaVencida = true;
            break;
          case MensajesRespuestaAutenticacion.UsuarioPreactivo:
            this.mostrarModalPreActivo = true;
            break;
          case MensajesRespuestaAutenticacion.UsuarioNoExiste:
            this.form.get('usuario')?.reset();
            this.form.get('contrasenia')?.reset();
            this.usuarioIncorrecto = !this.usuarioIncorrecto;
            break;
          case MensajesRespuestaAutenticacion.SIAPSinConexion:
            this.mostrarModalSIAPSinConexion = true;
            break;
          case MensajesRespuestaAutenticacion.SIAPDesactivado:
            this.mostrarModalSIAPDesactivado = true;
            break;
          case MensajesRespuestaAutenticacion.CuentaBloqueada:
            this.mostrarModalCuentaBloqueada = true;
            break;
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    });
  }

  actualizarContrasenia(): void {
    this.mostrarModalPreActivo = false;
    void this.router.navigate(["actualizar-contrasenia"], {relativeTo: this.activatedRoute});
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

  abrirModalRestablecerContrasenia(): void {
    this.dialogService.open(ModalRestablecerContraseniaComponent, {
      header: 'Restablecer contraseña',
      style: {maxWidth: '600px', width: '100%'},
      closable: false
    });
  }

  // cerrarModlRestablecerCont() {
  //   this.modales.restablecerContrasena = false;
  //   this.pasoRestablecerContrasena = 1;
  // }

  get f() {
    return this.form.controls;
  }


  ngOnDestroy(): void {
    clearInterval(this.refTemporizador)
  }

}
