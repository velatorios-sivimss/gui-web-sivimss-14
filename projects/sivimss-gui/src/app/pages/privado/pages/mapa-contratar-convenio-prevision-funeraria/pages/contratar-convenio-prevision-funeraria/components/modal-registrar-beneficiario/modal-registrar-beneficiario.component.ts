import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BusquedaConveniosPFServic } from '../../../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DatosGeneralesRenovacion } from '../../../../../consulta-convenio-prevision-funeraria/models/DatosGeneralesRenovacion.interface';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from 'projects/sivimss-gui/src/app/utils/constantes';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-registrar-beneficiario',
  templateUrl: './modal-registrar-beneficiario.component.html',
  styleUrls: ['./modal-registrar-beneficiario.component.scss'],
})
export class ModalRegistrarBeneficiarioComponent implements OnInit {
  form!: FormGroup;
  idConvenio: number = 0;
  fechaActual = new Date();
  parentesco: any[] = [];
  idVelatorio!: number;
  velatorio!: string;
  datosGeneralesRenovacion: DatosGeneralesRenovacion =
    {} as DatosGeneralesRenovacion;
  documento: string = '';
  nombreIne: string | null = null;
  nombreActa: string | null = null;
  esMenorEdad: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
    private alertaService: AlertaService,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.idConvenio = this.config.data['idConvenio'];
    this.parentesco = this.config.data['parentesco'];
    this.idVelatorio = this.config.data['idVelatorio'];
    this.velatorio = this.config.data['velatorio'];
    this.form = this.crearForm();
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
      idPersona: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],

      idConvenio: [
        {
          value: this.config.data['idConvenio'],
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      curp: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.pattern(PATRON_CURP)],
      ],
      nombre: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.maxLength(45)],
      ],
      primerApellido: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.maxLength(45)],
      ],
      segundoApellido: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.maxLength(45)],
      ],

      fechaNacimiento: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      fecha: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required],
      ],
      edad: [
        {
          value: null,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      idParentesco: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      parentesco: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required],
      ],

      rfc: [
        {
          value: null,
          disabled: false,
        },
        [
          Validators.required,
          Validators.pattern(PATRON_RFC),
          Validators.maxLength(13),
        ],
      ],
      telefono: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.maxLength(45)],
      ],

      correo: [
        {
          value: null,
          disabled: false,
        },
        [
          Validators.required,
          Validators.pattern(PATRON_CORREO),
          Validators.maxLength(45),
        ],
      ],
      actaNacimiento: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required],
      ],
      documento: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      nombreIne: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      nombreActa: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],

      validaIne: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      validaActa: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      velatorio: [
        {
          value: this.config.data['velatorio'],
          disabled: true,
        },
        [Validators.required],
      ],
      idContratante: [
        {
          value: this.config.data['idContratante'],
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      actualizaArchivo: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
    });
  }

  get f() {
    return this.form.controls;
  }

  calcularEdad(): void {
    this.f.edad.setValue(moment().diff(moment(this.f.fecha.value), 'years'));
    this.validarEdad();
  }

  validarEdad() {
    this.esMenorEdad = this.f.edad.value >= 18 ? true : false;
  }

  cerrarModal(): void {
    this.ref.close();
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
    const tipoArchivo = fileReaded.type.split('/');

    if (fileReaded.size > maxSize) {
      const tamanioEnMb = maxSize / 1000000;
      this.alertaService.mostrar(
        TipoAlerta.Info,
        `El tamaño máximo permititido es de ${tamanioEnMb} MB`
      );

      this.f.actaNacimiento.reset;
      return;
    }

    this.nombreIne =
      this.f.edad.value >= 18
        ? 'INE-' + this.f.curp.value + '.' + tipoArchivo[1]
        : null;
    this.nombreActa =
      this.f.edad.value < 18
        ? 'ACTA-' + this.f.curp.value + '.' + tipoArchivo[1]
        : null;

    this.f.nombreIne.setValue(this.nombreIne);
    this.f.nombreActa.setValue(this.nombreActa);
    this.f.actaNacimiento.setValue(this.nombreActa);

    if (this.f.edad.value >= 18) {
      this.f.actaNacimiento.setValue(this.nombreIne);
    }

    this.getBase64(fileReaded).then((data: any) => {
      this.documento = data;
      this.f.documento.setValue(data);
    });
  }

  consultarCURP() {
    if (!this.f.curp.value) return;

    if (this.f.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP no valido.');
      return;
    }
    if (this.f.curp.value.includes('XEXX010101HNEXXXA4')) return;

    if (this.f.curp.value.includes('XEXX010101MNEXXXA8')) return;

    if (this.form.controls.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      return;
    }
    if (!this.f.curp.value) return;
    this.buscarCurpRFC(this.f.curp.value, '');
  }

  convertirAMayusculas(posicionFormulario: number): void {
    const formularios = [this.f.curp, this.f.rfc];
    formularios[posicionFormulario].setValue(
      formularios[posicionFormulario].value.toUpperCase()
    );
  }

  validarCorreoElectronico(): void {
    if (this.f.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        'Tu correo electrónico no es válido. '
      );
    }
  }

  buscarCurpRFC(curp: string, rfc: string): void {
    let parametros = {
      curp: curp,
      rfc: rfc,
    };

    this.consultaConveniosService
      .buscarCurpRFC(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }
          console.log(respuesta.datos);
          if (respuesta.mensaje == 'Exito') {
            if (curp != '') {
              let valores = respuesta.datos[0];

              let [anioD, mesD, diaD] = valores.fechaNacimiento.split('-');
              let fechaNacimiento = new Date(anioD + '/' + mesD + '/' + diaD);
              console.log([diaD, mesD, anioD]);
              [diaD, mesD, anioD] = [anioD, mesD, diaD];
              this.f.idPersona.setValue(valores.idPersona);
              this.f.nombre.setValue(valores.nomPersona);
              this.f.nombre.setValue(valores.nomPersona);
              this.f.primerApellido.setValue(valores.primerApellido);
              this.f.segundoApellido.setValue(valores.segundoApellido);
              this.f.fecha.setValue(fechaNacimiento);
              this.f.telefono.setValue(valores.telefono);
              this.f.correo.setValue(valores.correo);
              this.f.correo.setValue(valores.correo);
              this.calcularEdad();
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
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

  validarRFC(): void {
    if (!this.f.rfc.value) return;
    this.f.rfc.clearValidators();
    this.f.rfc.updateValueAndValidity();
    if (this.f.rfc.value.includes('XAXX010101000')) return;
    if (!this.f.rfc.value.match(PATRON_RFC)) {
      this.mostrarMensaje(33);
      this.f.rfc.setValidators(Validators.pattern(PATRON_RFC));
      this.f.rfc.updateValueAndValidity();
    }
  }

  guardar(): void {
    if (!this.form.valid) {
      return;
    }

    this.loaderService.activar();
    this.f.validaIne.setValue(Number(this.f.edad.value) >= 18 ? 1 : null);
    this.f.validaActa.setValue(Number(this.f.edad.value) < 18 ? 1 : null);
    this.f.idParentesco.setValue(this.f.parentesco.value);
    this.consultaConveniosService
      .altaBeneficiario(this.form.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.ref.close('exito');
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Beneficiario agregado correctamente'
            );
          } else {
            this.mostrarMensaje(Number(respuesta.mensaje));
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(-1);
        },
      });
  }
}
