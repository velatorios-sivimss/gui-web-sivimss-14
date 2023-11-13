import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-editar-beneficiario',
  templateUrl: './modal-editar-beneficiario.component.html',
  styleUrls: ['./modal-editar-beneficiario.component.scss']
})
export class ModalEditarBeneficiarioComponent implements OnInit {

  form!: FormGroup;

  fechaActual = new Date();

  dummyDropdown: { label: string; value: number }[] = [
    { label: 'Opción 1', value: 1 },
    { label: 'Opción 2', value: 2 },
  ];

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.crearForm();
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
      nombre: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      primerApellido: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      segundoApellido: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      edad: [
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
      actaNacimiento: [
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
        [Validators.nullValidator],
      ],
      correoElectronico: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      velatorio: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      telefono: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
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

}
