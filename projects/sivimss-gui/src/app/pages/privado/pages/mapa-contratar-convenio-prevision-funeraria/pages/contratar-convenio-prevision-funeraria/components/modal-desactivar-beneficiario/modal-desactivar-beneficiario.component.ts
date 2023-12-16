import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Beneficiarios } from '../../../../../consulta-convenio-prevision-funeraria/models/Beneficiarios.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BusquedaConveniosPFServic } from '../../../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PATRON_CORREO } from 'projects/sivimss-gui/src/app/utils/constantes';

@Component({
  selector: 'app-modal-desactivar-beneficiario',
  templateUrl: './modal-desactivar-beneficiario.component.html',
  styleUrls: ['./modal-desactivar-beneficiario.component.scss'],
})
export class ModalDesactivarBeneficiarioComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;
  form!: FormGroup;
  documento: string = '';
  nombreIne: string | null = null;
  nombreActa: string | null = null;
  actualizaArchivo: boolean = false;
  fechaActual = new Date();
  esMenorEdad: boolean = false;

  mensajeError: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  constructor(
    private readonly formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
    private alertaService: AlertaService,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.beneficiarios = this.config.data['item'];
    this.crearForm();
  }

  crearForm(): void {
    this.esMenorEdad = this.beneficiarios.edad >= 18 ? true : false;
    this.form = this.formBuilder.group({
      nombre: [
        {
          value: this.beneficiarios.nombreAfiliado,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      primerApellido: [
        {
          value: this.beneficiarios.primerApellido,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      segundoApellido: [
        {
          value: this.beneficiarios.segundoApellido,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      edad: [
        {
          value: this.beneficiarios.edad,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      parentesco: [
        {
          value: this.beneficiarios.parentesco,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      curp: [
        {
          value: this.beneficiarios.curp,
          disabled: true,
        },
        [Validators.required],
      ],
      rfc: [
        {
          value: this.beneficiarios.rfc,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      actaNacimiento: [
        {
          value: this.beneficiarios.ine,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      fecha: [
        {
          value: this.beneficiarios.fechaNacimiento,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      correoElectronico: [
        {
          value: this.beneficiarios.correo,
          disabled: true,
        },
        [
          Validators.required,
          Validators.pattern(PATRON_CORREO),
          Validators.max(45),
        ],
      ],
      velatorio: [
        {
          value: this.beneficiarios.velatorio,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      telefono: [
        {
          value: this.beneficiarios.telefono,
          disabled: true,
        },
        [Validators.required],
      ],
      documento: [
        {
          value: null,
          disabled: false,
        },
      ],
    });
  }

  guardar(): void {
    this.loaderService.activar();
    let parametros = {
      idContratante: this.beneficiarios.idContratanteBeneficiarios,
      idPersona: this.beneficiarios.idPersona,
    };
    this.consultaConveniosService
      .desactivarBeneficiario(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Beneficiario eliminado correctamente'
            );
            this.ref.close('exito');
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
        },
      });
  }
  get f() {
    return this.form.controls;
  }

  cerrarModal(): void {
    this.ref.close();
  }

  validarCorreoElectronico(): void {
    if (this.f.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        'Tu correo electrónico no es válido. '
      );
    }
  }

  mostrarMensaje(numero: number): void {
    switch (numero) {
      case 5:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al guardar la información. Intenta nuevamente.'
        );
        break;
      case 33:
        this.alertaService.mostrar(TipoAlerta.Info, 'R.F.C. no valido.');
        break;
      case 52:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al consultar la información.'
        );
        break;
      case 184:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El servicio de RENAPO  no esta disponible.'
        );
        break;
      case 185:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El código postal no existe.'
        );
        break;
      case 186:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'El servicio no responde, no permite más llamadas.'
        );
        break;
      case 187:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;
      case 802:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El beneficiario ya fue registrado con anterioridad, ingrese un beneficiario diferente.'
        );
        break;
      case 900:
        this.alertaService.mostrar(TipoAlerta.Info, 'Selecciona un paquete.');
        break;
      default:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
    }
  }
}
