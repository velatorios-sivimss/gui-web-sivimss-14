import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BusquedaConveniosPFServic } from '../../../../services/busqueda-convenios-pf.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DatosGeneralesRenovacion } from '../../../../models/DatosGeneralesRenovacion.interface';

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
  dummyDropdown: { label: string; value: number }[] = [
    { label: 'Opción 1', value: 1 },
    { label: 'Opción 2', value: 2 },
  ];

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
    console.log(this.idConvenio);
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
        [Validators.required],
      ],
      rfc: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
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
        [Validators.required],
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

  handleClick(controlName: string, formato: string) {
    // let elements = document.getElementById(`upload-file-${formato}`);
    // this.controlName = controlName;
    // elements?.click();
  }

  addAttachment(fileInput: any) {
    // const fileReaded = fileInput.target.files[0];
    // if (this.controlName === 'archivoXml') {
    //   this.importeFactura = null;
    //   this.folioFiscal = null;
    //   let reader = new FileReader();
    //   reader.onload = () => {
    //     let xml_content = reader.result ?? '';
    //     if (typeof xml_content === 'string') {
    //       let parser = new DOMParser();
    //       let xmlDoc = parser.parseFromString(xml_content, 'text/xml');
    //       let comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
    //       this.importeFactura = Number(comprobante.getAttribute('Total'));
    //       let complemento = xmlDoc.getElementsByTagName('cfdi:Complemento')[0];
    //       this.folioFiscal = complemento.getElementsByTagName('tfd:TimbreFiscalDigital')[0].getAttribute('UUID');
    //       this.generarHojaConsignacionForm.get('folio')?.setValue(this.folioFiscal);
    //       const formatter = new Intl.NumberFormat("en-US", {
    //         style: 'currency',
    //         currency: 'USD',
    //         minimumFractionDigits: 2,
    //       });
    //       this.importeFacturaFormat = formatter.format(this.importeFactura);
    //     }
    //   }
    //   if (fileReaded) reader.readAsText(fileReaded);
    // }
    // if (fileReaded) {
    //   this.generarHojaConsignacionForm.get(this.controlName)?.setValue(fileReaded.name);
    // } else {
    //   this.generarHojaConsignacionForm.get(this.controlName)?.setValue(null);
    // }
  }

  get f() {
    return this.form.controls;
  }

  guardar(): void {
    this.ref.close(this.datosGeneralesRenovacion);
  }

  cerrarModal(): void {
    this.ref.close();
  }
}
