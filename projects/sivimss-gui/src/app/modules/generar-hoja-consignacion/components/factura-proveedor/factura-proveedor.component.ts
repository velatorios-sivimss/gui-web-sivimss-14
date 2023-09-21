import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { GenerarHojaConsignacion, GenerarHojaConsignacionBusqueda } from '../../models/generar-hoja-consignacion.interface';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';

@Component({
  selector: 'app-factura-proveedor',
  templateUrl: './factura-proveedor.component.html',
  styleUrls: ['./factura-proveedor.component.scss'],
  providers: [DialogService]
})
export class FacturaProveedorComponent implements OnInit {

  public generarHojaConsignacionForm!: FormGroup;
  public controlName: string = '';
  public costoTotal: string | null = '';
  public importeFactura: string | null = '';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private generarHojaConsignacionService: GenerarHojaConsignacionService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarAgregarActividadesForm();
  }

  inicializarAgregarActividadesForm() {
    this.generarHojaConsignacionForm = this.formBuilder.group({
      folio: new FormControl({ value: null, disabled: true }, []),
      archivoXml: new FormControl({ value: null, disabled: false }, []),
      archivoPdf: new FormControl({ value: null, disabled: false }, []),
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  guardar(): void {

  }

  datosGuardar(actividad: GenerarHojaConsignacionBusqueda): GenerarHojaConsignacion {
    return {
      idFormatoRegistro: this.apf.folio.value,
      idVelatorio: this.apf.velatorio.value,
      fecInicio: this.apf.fechaInicio.value,
      fecFin: this.apf.fechaFinal.value,
    }
  }

  handleClick(controlName: string, formato: string) {
    let elements = document.getElementById(`upload-file-${formato}`);
    this.controlName = controlName;
    elements?.click();
  }

  addAttachment(fileInput: any) {
    const fileReaded = fileInput.target.files[0];

    if (this.controlName === 'archivoXml') {
      this.costoTotal = null;
      this.importeFactura = null;
      let reader = new FileReader();
      reader.onload = () => {
        let xml_content = reader.result ?? '';
        if (typeof xml_content === 'string') {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(xml_content, 'text/xml');
          let consignacion = xmlDoc.getElementsByTagName('consignacion')[0];
          this.costoTotal = consignacion.getElementsByTagName('costo')[0].textContent;
          this.importeFactura = consignacion.getElementsByTagName('importe')[0].textContent;
        }
      }
      if (fileReaded) reader.readAsText(fileReaded);
    }

    if (fileReaded) {
      this.generarHojaConsignacionForm.get(this.controlName)?.setValue(fileReaded.name);
    } else {
      this.generarHojaConsignacionForm.get(this.controlName)?.setValue(null);
    }
  }

  get apf() {
    return this.generarHojaConsignacionForm.controls;
  }
}
