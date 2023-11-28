import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalEditarBeneficiarioComponent } from '../../components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ModalDesactivarBeneficiarioComponent } from '../../components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import { ModalRegistrarBeneficiarioComponent } from '../../components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-registro-persona-grupo',
  templateUrl: './registro-persona-grupo.component.html',
  styleUrls: ['./registro-persona-grupo.component.scss']
})
export class RegistroPersonaGrupoComponent implements OnInit {

  form!: FormGroup;

  dummyDropdown: { label: string; value: number }[] = [
    { label: 'Opción 1', value: 1 },
    { label: 'Opción 2', value: 2 },
  ];

  fechaActual: Date = new Date();

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  beneficiarios: any[] = [
    {
      id: 1,
      fecha: '',
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      edad: '',
      parentesco: '',
      curp: '',
      rfc: '',
      actaNacimiento: '',
      correoElectronico: '',
      telefono: '',
    },
    {
      id: 2,
      fecha: '',
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      edad: '',
      parentesco: '',
      curp: '',
      rfc: '',
      actaNacimiento: '',
      correoElectronico: '',
      telefono: '',
    },
    {
      id: 3,
      fecha: '',
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      edad: '',
      parentesco: '',
      curp: '',
      rfc: '',
      actaNacimiento: '',
      correoElectronico: '',
      telefono: '',
    },
  ];

  
  mostrarModalTipoArchivoIncorrecto: boolean = false;
  mostrarModalConfirmacionInformacionCapturada: boolean = false;
  mostrarModalValidacionRegistro: boolean = false;

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
      datosPersonales: this.formBuilder.group({
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        rfc: [
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
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      domicilio: this.formBuilder.group({
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
        pais: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
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
        correoElectronico: [
          {
            value: null,
            disabled: false,
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
        enfermedadPrexistente: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
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
      }),
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

}
