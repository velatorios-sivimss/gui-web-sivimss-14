import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {confirmacionContraseniadValidator} from "../actualizar-contrasenia/actualizar-contrasenia.component";

@Component({
  selector: 'app-restablecer-contrasenia',
  templateUrl: './restablecer-contrasenia.component.html',
  styleUrls: ['./restablecer-contrasenia.component.scss']
})
export class RestablecerContraseniaComponent implements OnInit {

  form!: FormGroup;
  usuario: string = ''

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
    this.activatedRoute.queryParams.subscribe(params => {
      this.usuario = params['usuario'];
    });
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
        usuario: [{value: this.usuario, disabled: true}],
        contraseniaNueva: ['', Validators.required],
        contraseniaConfirmacion: ['', Validators.required]
      },
      {
        validators: [confirmacionContraseniadValidator]
      }
    );
  }

  restablecerContrasenia(): void {
    if (this.form.invalid) return;
    const form = this.form.getRawValue();
    this.loaderService.activar();
    this.autenticacionService.actualizarContrasenia(form.usuario, "", form.contraseniaNueva).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<unknown>): void => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Contraseña actualizada');
          this.router.navigate(["../"], {
            relativeTo: this.activatedRoute
          });
        }
      },
      (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    );
  }

  get f() {
    return this.form.controls;
  }

}
