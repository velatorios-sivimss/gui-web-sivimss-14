import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BusquedaConveniosPFServic } from '../../../../services/busqueda-convenios-pf.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DatosGeneralesRenovacion } from '../../../../models/DatosGeneralesRenovacion.interface';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from 'projects/sivimss-gui/src/app/utils/constantes';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
@Component({
  selector: 'app-modal-registrar-nuevo-beneficiario',
  templateUrl: './modal-registrar-nuevo-beneficiario.component.html',
  styleUrls: ['./modal-registrar-nuevo-beneficiario.component.scss'],
})
export class ModalRegistrarNuevoBeneficiarioComponent implements OnInit {
  form!: FormGroup;
  idConvenio: number = 0;
  fechaActual = new Date();
  parentesco: any[] = [];
  idVelatorio!: number;
  velatorio!: string;
  datosGeneralesRenovacion: DatosGeneralesRenovacion =
    {} as DatosGeneralesRenovacion;
  documento: string = '';
  nombreIne: string = '';
  nombreActa: string = '';
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
      nombre: [
        {
          value: null,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      primerApellido: [
        {
          value: null,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      segundoApellido: [
        {
          value: null,
          disabled: true,
        },
        [Validators.nullValidator],
      ],
      edad: [
        {
          value: null,
          disabled: true,
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
      curp: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.pattern(PATRON_CURP)],
      ],
      rfc: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.pattern(PATRON_RFC)],
      ],
      actaNacimiento: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required],
      ],
      fecha: [
        {
          value: null,
          disabled: true,
        },
        [Validators.required],
      ],
      correoElectronico: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.pattern(PATRON_CORREO)],
      ],
      velatorio: [
        {
          value: this.config.data['velatorio'],
          disabled: true,
        },
        [Validators.required],
      ],
      telefono: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required],
      ],
    });
  }

  get f() {
    return this.form.controls;
  }

  guardar(): void {
    this.esMenorEdad = this.f.edad.value >= 18 ? true : false;
    //this.ref.close(this.datosGeneralesRenovacion);
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

    if (fileReaded.size > maxSize) {
      const tamanioEnMb = maxSize / 1000000;
      this.alertaService.mostrar(
        TipoAlerta.Info,
        `El tamaño máximo permititido es de ${tamanioEnMb} MB`
      );

      this.f.actaNacimiento.reset;
      return;
    }

    this.nombreIne = this.f.edad.value >= 18 ? fileReaded.name : null;
    this.nombreActa = this.f.edad.value < 18 ? fileReaded.name : null;
    this.f.actaNacimiento = fileReaded.name;

    this.getBase64(fileReaded).then((data: any) => {
      this.documento = data;
    });
  }

  consultarCURP() {
    if (!this.f.curp.value) {
      return;
    }
    if (this.f.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP no valido.');
      return;
    }
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
}
