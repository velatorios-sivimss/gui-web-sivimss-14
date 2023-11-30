import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Beneficiarios } from '../../../../models/Beneficiarios.interface';

@Component({
  selector: 'app-modal-editar-beneficiario',
  templateUrl: './modal-editar-beneficiario.component.html',
  styleUrls: ['./modal-editar-beneficiario.component.scss'],
})
export class ModalEditarBeneficiarioComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;
  form!: FormGroup;

  fechaActual = new Date();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    public readonly config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.beneficiarios = this.config.data['item'];
    this.form = this.crearForm();
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
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
        [Validators.nullValidator],
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
