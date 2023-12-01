import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Beneficiarios } from '../../../../models/Beneficiarios.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BusquedaConveniosPFServic } from '../../../../services/busqueda-convenios-pf.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from 'projects/sivimss-gui/src/app/utils/constantes';

@Component({
  selector: 'app-modal-editar-beneficiario',
  templateUrl: './modal-editar-beneficiario.component.html',
  styleUrls: ['./modal-editar-beneficiario.component.scss'],
})
export class ModalEditarBeneficiarioComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;
  form!: FormGroup;
  documento: string = '';
  nombreIne: string = '';
  nombreActa: string = '';
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
          value: null,
          disabled: false,
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
          disabled: false,
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
          disabled: false,
        },
        [Validators.required],
      ],
      documento: [
        {
          value: this.beneficiarios.telefono,
          disabled: false,
        },
      ],
    });
  }

  handleClick(controlName: string) {
    let elements = document.getElementById(`upload-file`);
    console.log(elements);
    controlName = controlName;
    elements?.click();
  }

  getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  addAttachment(fileInput: any) {
    const maxSize = 5000000;
    const fileReaded = fileInput.target.files[0];

    if (fileReaded.size > maxSize) {
      const tamanioEnMb = maxSize / 1000000;
      this.alertaService.mostrar(
        TipoAlerta.Info,
        `El tamaño máximo permititido es de ${tamanioEnMb} MB`
      );

      this.f.actaNacimiento.reset;
      this.actualizaArchivo = false;
      return;
    }

    this.actualizaArchivo = true;
    this.nombreIne = this.beneficiarios.edad >= 18 ? fileReaded.name : null;
    this.nombreActa = this.beneficiarios.edad < 18 ? fileReaded.name : null;
    this.f.actaNacimiento = fileReaded.name;
    console.log(fileReaded.name);

    this.getBase64(fileReaded).then((data: any) => {
      this.documento = data;
    });
  }

  guardar(): void {
    console.log(this.form.valid);
    if (!this.form.valid) {
      return;
    }
    const parametros = {
      documento: this.documento,
      nombreIne: this.nombreIne,
      nombreActa: this.nombreActa,
      validaIne: this.beneficiarios.edad >= 18 ? 1 : null,
      validaActa: this.beneficiarios.edad < 18 ? 1 : null,
      idContratante: this.beneficiarios.idContratanteBeneficiarios,
      idPersona: this.beneficiarios.idPersona,
      telefono: this.f.telefono.value,
      correo: this.f.correoElectronico.value,
      actualizaArchivo: this.actualizaArchivo,
    };

    if (this.beneficiarios.edad >= 18) {
      this.beneficiarios.ine = this.nombreIne;
    }
    if (this.beneficiarios.edad < 18) {
      this.beneficiarios.actaNacimiento = this.nombreActa;
    }

    this.beneficiarios.correo = this.f.correoElectronico.value;
    this.beneficiarios.telefono = this.f.telefono.value;
    this.consultaConveniosService
      .actualizarBeneficiario(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
            return;
          }
          this.alertaService.mostrar(
            TipoAlerta.Exito,
            'Beneficiario actualizado correctamente'
          );
          this.ref.close(this.beneficiarios);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
        },
      });

    console.log(parametros);
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
}
