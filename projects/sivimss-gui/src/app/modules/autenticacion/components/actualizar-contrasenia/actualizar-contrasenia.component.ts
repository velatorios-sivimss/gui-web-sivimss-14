import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRespuesta } from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { finalize } from "rxjs/operators";

/**
 * Valida que la contraseña anterior sea diferente a la nueva
 */
export function contraseniasDiferentesdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const contraseniaAnterior = control.get('contraseniaAnterior');
    const contraseniaNueva = control.get('contraseniaNueva');
    return contraseniaAnterior && contraseniaNueva && contraseniaAnterior.value !== contraseniaNueva.value ? null : {contraseniasIguales: true};
  };
}

/**
 * Valida que la contraseña nueva y la confirmacion de la nueva contraseña sean iguales.
 */
export const confirmacionContraseniadValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const contraseniaNueva = control.get('contraseniaNueva');
  const contraseniaConfirmacion = control.get('contraseniaConfirmacion');
  return contraseniaNueva && contraseniaConfirmacion && contraseniaNueva.value === contraseniaConfirmacion.value ? null : {contraseniasDiferentes: true};
};


@Component({
  selector: 'app-actualizar-contrasenia',
  templateUrl: './actualizar-contrasenia.component.html',
  styleUrls: ['./actualizar-contrasenia.component.scss']
})
export class ActualizarContraseniaComponent implements OnInit {

  form!: FormGroup;
  private readonly contraseniaAnterior: string = '';

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
        contraseniaNueva: ['', Validators.required],
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
    this.loaderService.activar();
    this.autenticacionService.actualizarContrasenia(usuario, contraseniaAnterior, contraseniaNueva).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<unknown>) => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Contraseña actualizada');
          this.router.navigate(["../"], {
            relativeTo: this.activatedRoute
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    );
  }

  get f() {
    return this.form.controls;
  }

}
