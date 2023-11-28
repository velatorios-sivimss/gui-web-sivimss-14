import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ModalEditarBeneficiarioComponent } from '../../../consulta-convenio-prevision-funeraria/pages/mi-convenio-prevision-funeraria/components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ModalDesactivarBeneficiarioComponent } from '../../../mapa-contratar-convenio-prevision-funeraria/pages/contratar-convenio-prevision-funeraria/components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import { ModalRegistrarBeneficiarioComponent } from '../../../mapa-contratar-convenio-prevision-funeraria/pages/contratar-convenio-prevision-funeraria/components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';

@Component({
  selector: 'app-contratar-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './contratar-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './contratar-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
})
export class ContratarPlanServiciosFunerariosPagoAnticipadoComponent
  implements OnInit
{
  form!: FormGroup;

  dummyDropdown: { label: string; value: number }[] = [
    { label: 'Opción 1', value: 1 },
    { label: 'Opción 2', value: 2 },
  ];

  fechaActual: Date = new Date();

  @ViewChild('overlayPanel')
  overlayPanel!: OverlayPanel;

  beneficiarios = [
    {
      id: 1,
      curp: 'ABC123456DEF789XYZ',
      rfc: 'RFC123456XYZ',
      matricula: 'M12345',
      nss: 'NSS987654',
      nombre: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      sexo: 'Masculino',
      fechaNacimiento: '1990-05-15',
      nacionalidad: 'Mexicana',
      paisNacimiento: 'México',
      lugarNacimiento: 'Ciudad de México',
      telefono: '555-123-4567',
      correoElectronico: 'juan.perez@example.com',
      calle: 'Calle Principal',
      noExt: '123',
      noInt: 'A',
      cp: '12345',
      colonia: 'Centro',
      municipio: 'Ciudad',
      estado: 'Estado de México',
    },
    {
      id: 2,
      curp: 'XYZ987654ABC321PQR',
      rfc: 'RFC789012PQR',
      matricula: 'M54321',
      nss: 'NSS123456',
      nombre: 'María',
      primerApellido: 'López',
      segundoApellido: 'Martínez',
      sexo: 'Femenino',
      fechaNacimiento: '1985-10-20',
      nacionalidad: 'Mexicana',
      paisNacimiento: 'México',
      lugarNacimiento: 'Guadalajara',
      telefono: '555-789-1234',
      correoElectronico: 'maria.lopez@example.com',
      calle: 'Avenida Principal',
      noExt: '567',
      noInt: '',
      cp: '54321',
      colonia: 'Residencial',
      municipio: 'Guadalajara',
      estado: 'Jalisco',
    },
  ];

  mostrarModalTipoArchivoIncorrecto: boolean = false;
  mostrarModalConfirmacionInformacionCapturada: boolean = false;
  mostrarModalValidacionRegistro: boolean = false;
  mostrarModalDesactivarBeneficiarioGrupo: boolean = false;
  TIPO_CONTRATACION_PERSONA: string = 'persona';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.form = this.crearForm();
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
      tipoContratacion: [
        {
          value: this.TIPO_CONTRATACION_PERSONA,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      datosPersonales: this.formBuilder.group({
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
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],

        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoCelular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
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
      }),
      domicilio: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      datosPersonalesTitularSubstituto: this.formBuilder.group({
        sonDatosTitular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
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
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],

        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoCelular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
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
      }),
      domicilioTitularSubstituto: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      paquetes: this.formBuilder.group({
        paqueteEconomico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paqueteBasico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paqueteCremacion: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        numeroPago: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),

      gestionadoPorPromotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      promotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
    });
  }

  abrirModalDetalleBeneficiarios(event: any) {}

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

  abrirModalRegistroBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalRegistrarBeneficiarioComponent, {
      header: 'Registrar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }

  abrirModalEditarBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }

  abrirModalDesactivarBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalDesactivarBeneficiarioComponent, {
      header: 'Desactivar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  get f() {
    return this.form.controls;
  }

  get datosPersonales() {
    return (this.form.controls['datosPersonales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.form.controls['domicilio'] as FormGroup).controls;
  }

  get paquetes() {
    return (this.form.controls['paquetes'] as FormGroup).controls;
  }

  get datosPersonalesTitularSubstituto() {
    return (this.form.controls['datosPersonalesTitularSubstituto'] as FormGroup)
      .controls;
  }

  get domicilioTitularSubstituto() {
    return (this.form.controls['domicilioTitularSubstituto'] as FormGroup)
      .controls;
  }
}
