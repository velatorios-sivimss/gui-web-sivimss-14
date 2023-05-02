import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { MensajesRespuestaCodigo } from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-codigo.enum";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";

@Component({
  selector: 'app-modal-restablecer-contrasenia',
  templateUrl: './modal-restablecer-contrasenia.component.html',
  styleUrls: ['./modal-restablecer-contrasenia.component.scss']
})
export class ModalRestablecerContraseniaComponent implements OnInit, OnDestroy {
  readonly CONFIRMACION_RESTABLECER_CONTRASENIA = 1;
  readonly CAPTURA_DE_USUARIO: number = 2;
  readonly CAPTURA_DE_CODIGO: number = 3;
  formRestContraUsuario!: FormGroup;
  formRestContraCodigo!: FormGroup;
  pasoRestablecerContrasena: number = 1;
  subGeneracionCodigo!: Subscription;
  subValidacionCodigo!: Subscription;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly autenticacionService: AutenticacionService,
    private readonly alertaService: AlertaService,
    private readonly loaderService: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.formRestContraUsuario = this.formBuilder.group({
      usuario: ['', Validators.required],
    });

    this.formRestContraCodigo = this.formBuilder.group({
      codigo: ['', Validators.required],
    });
  }

  generarCodigo() {
    const {usuario} = this.formRestContraUsuario.value;
    this.loaderService.activar();
    this.subGeneracionCodigo = this.autenticacionService.generarCodigoRestablecerContrasenia(usuario).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      () => {
        this.pasoRestablecerContrasena = this.CAPTURA_DE_CODIGO;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Código enviado.');
      },
      (error: HttpErrorResponse) => {
        console.error('Ha ocurrido un error en el servicio', error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    )
  }

  validarCodigo() {
    const {usuario} = this.formRestContraUsuario.value;
    const {codigo} = this.formRestContraCodigo.value;
    this.loaderService.activar();
    this.subValidacionCodigo = this.autenticacionService.validarCodigoRestablecerContrasenia(usuario, codigo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: string) => {
        switch (respuesta) {
          case MensajesRespuestaCodigo.CodigoCorrecto:
            this.alertaService.mostrar(TipoAlerta.Exito, 'Código ingresado correctamente');
            this.cerrarModal();
            break;
          case MensajesRespuestaCodigo.CodigoIncorrecto:
            this.alertaService.mostrar(TipoAlerta.Error, 'Código incorrecto');
            this.formRestContraCodigo.get('codigo')?.reset();
            break;
          case MensajesRespuestaCodigo.CodigoExpirado:
            this.alertaService.mostrar(TipoAlerta.Error, 'Código expirado');
            this.cerrarModal();
            break;
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Ha ocurrido un error en el servicio', error);
        this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error');
      }
    )
  }

  cerrarModal() {
    this.ref.close(true);
  }

  get frcu() {
    return this.formRestContraUsuario.controls;
  }

  get frcc() {
    return this.formRestContraCodigo.controls;
  }

  ngOnDestroy(): void {
    this.subGeneracionCodigo?.unsubscribe();
    this.subValidacionCodigo?.unsubscribe();
  }
}
