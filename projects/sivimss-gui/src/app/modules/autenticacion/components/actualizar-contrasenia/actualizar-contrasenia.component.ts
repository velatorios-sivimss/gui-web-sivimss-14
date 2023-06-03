import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  MENSAJE_ERROR_CONTRASENIA: string = "La contraseña ingresada no es válida, debe cumplir la siguiente norma: "
  + "- Mínimo 8 caracteres." 
  + "- Mínimo una mayúscula."
  + "- Mínimo una letra minúscula."
  + "- Mínimo un dígito numérico."
  + "- Mínimo, un carácter especial."
  + "- No debe de tener dos dígitos iguales junto."

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
        contraseniaNueva: new FormControl('', Validators.compose([Validators.required, this.pwdValidator])),
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

  pwdValidator(control: FormControl): { [key: string]: boolean } | null {
    const password = control.value;
    let hayError: boolean = false;
  
    // Mínimo 8 caracteres
    if (password.length < 8) {
      hayError = true;
      return { minLength: true };
    }
  
    // Mínimo una mayúscula
    if (!/[A-Z]/.test(password)) {
      hayError = true;
      return { uppercaseRequired: true };
    }
  
    // Mínimo una letra minúscula
    if (!/[a-z]/.test(password)) {
      hayError = true;
      return { lowercaseRequired: true };
    }
  
    // Mínimo un dígito numérico
    if (!/\d/.test(password)) {
      hayError = true;
      return { digitRequired: true };
    }
  
    // Mínimo un caracter especial
    if (!/[^A-Za-z0-9]/.test(password)) {
      hayError = true;
      return { specialCharRequired: true };
    }
  
    // No debe tener dos dígitos iguales juntos
    if (/(\d)\1/.test(password)) {
      hayError = true;
      return { consecutiveDigits: true };
    }
  
    // En caso de que se repitan 2 letras de forma consecutiva, la segunda cambiará por un caracter especial
    if (/([a-zA-Z])\1/.test(password)) {
      hayError = true;
      return { consecutiveLetters: true };
    }

    if(hayError) {
      this.alertaService.mostrar(TipoAlerta.Info, this.MENSAJE_ERROR_CONTRASENIA);
    }
  
    return null;
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
    ).subscribe({
      next: (respuesta: HttpRespuesta<unknown>) => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Contraseña actualizada correctamente.');
          this.router.navigate(["../"], {
            relativeTo: this.activatedRoute
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
  });
  }

  get f() {
    return this.form.controls;
  }

}
