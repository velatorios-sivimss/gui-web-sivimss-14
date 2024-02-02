import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { confirmacionContraseniadValidator } from '../actualizar-contrasenia/actualizar-contrasenia.component';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
// import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { PATRON_CONTRASENIA } from 'projects/sivimss-gui/src/app/utils/regex';
import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';

@Component({
  selector: 'app-restablecer-contrasenia',
  templateUrl: './restablecer-contrasenia.component.html',
  styleUrls: ['./restablecer-contrasenia.component.scss'],
})
export class RestablecerContraseniaComponent implements OnInit {
  form!: FormGroup;
  mostrarModalFormatoContrasenia: boolean = false;
  usuario: string = '';

  constructor(
    public autenticacionContratanteService: AutenticacionService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.usuario = params['usuario']
    });
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group(
      {
        usuario: [{ value: this.autenticacionContratanteService.usuario ?? this.usuario, disabled: true }, [Validators.required]],
        contraseniaAnterior: [{ value: this.autenticacionContratanteService.contrasenia, disabled: true }],
        contraseniaNueva: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CONTRASENIA)]],
        contraseniaConfirmacion: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CONTRASENIA)]],
      },
      { validators: [confirmacionContraseniadValidator] }
    );
  }

  restablecerContrasenia(): void {
    if (this.form.invalid) return;
    const form = this.form.getRawValue();
    this.loaderService.activar();
    this.autenticacionContratanteService
      .actualizarContraseniaNewLogin(form.usuario, '', form.contraseniaNueva)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<unknown>): void => {
          if (respuesta.codigo === 200) {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Contraseña actualizada correctamente.'
            );
            void this.router.navigate(['/externo-publico/autenticacion/inicio-sesion'], {
              relativeTo: this.activatedRoute,
            });
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
        },
      });
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

  get f() {
    return this.form.controls;
  }
}
