import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AdjuntarFactura } from '../../models/generar-hoja-consignacion.interface';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-factura-proveedor',
  templateUrl: './factura-proveedor.component.html',
  styleUrls: ['./factura-proveedor.component.scss'],
  providers: [DialogService]
})
export class FacturaProveedorComponent implements OnInit {

  public generarHojaConsignacionForm!: FormGroup;
  public controlName: string = '';
  public costoTotal: string | null = null;
  public importeFactura: string | null = '';
  public idHojaConsig: number | null = null;
  public folioFiscal: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
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
      archivoXml: new FormControl({ value: null, disabled: false }, [Validators.required]),
      archivoPdf: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  guardar() {
    this.loaderService.activar();
    this.generarHojaConsignacionService.generarHoja(this.datosGuardar()).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Agregado correctamente');
          this.cancelar();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  datosGuardar(): AdjuntarFactura {
    return {
      idHojaConsig: this.idHojaConsig,
      folioFiscal: this.folioFiscal,
      costoFactura: this.costoTotal ? +this.costoTotal : 0,
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
