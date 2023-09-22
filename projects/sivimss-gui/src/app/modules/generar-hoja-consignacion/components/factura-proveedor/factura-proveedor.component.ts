import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AdjuntarFactura, GenerarHojaConsignacionBusqueda, HojaConsignacionDetalle } from '../../models/generar-hoja-consignacion.interface';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-factura-proveedor',
  templateUrl: './factura-proveedor.component.html',
  styleUrls: ['./factura-proveedor.component.scss'],
  providers: [DialogService]
})
export class FacturaProveedorComponent implements OnInit {

  public generarHojaConsignacionForm!: FormGroup;
  public controlName: string = '';
  public costoTotal: number | null = null;
  public importeFactura: number | null = null;
  public folioFiscal: string | null = '';
  public hojaSeleccionada!: GenerarHojaConsignacionBusqueda;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    private generarHojaConsignacionService: GenerarHojaConsignacionService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.hojaSeleccionada = this.config.data.hojaSeleccionada;
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarAgregarActividadesForm();
    this.obtenerDetalle();
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

  obtenerDetalle() {
    if (this.hojaSeleccionada.idHojaConsig) {
      this.loaderService.activar();
      this.generarHojaConsignacionService.obtenerDetalleHojaConsignacion(this.hojaSeleccionada.idHojaConsig)
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<HojaConsignacionDetalle>) => {
            if (respuesta.datos) {
              this.costoTotal = respuesta.datos.totalCosto ?? null;
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          }
        });
    }
  }

  guardar() {
    this.loaderService.activar();
    this.generarHojaConsignacionService.adjuntarFactura(this.datosGuardar()).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          if (respuesta.error) {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
          } else {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Factura agregada correctamente');
            this.cancelar();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  datosGuardar(): AdjuntarFactura {
    return {
      idHojaConsig: this.hojaSeleccionada.idHojaConsig ?? null,
      folioFiscal: this.folioFiscal,
      costoFactura: this.importeFactura,
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
      this.importeFactura = null;
      this.folioFiscal = null;
      let reader = new FileReader();
      reader.onload = () => {
        let xml_content = reader.result ?? '';
        if (typeof xml_content === 'string') {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(xml_content, 'text/xml');
          let comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
          this.importeFactura = Number(comprobante.getAttribute('Total'));
          let complemento = xmlDoc.getElementsByTagName('cfdi:Complemento')[0];
          this.folioFiscal = complemento.getElementsByTagName('tfd:TimbreFiscalDigital')[0].getAttribute('UUID');
          this.generarHojaConsignacionForm.get('folio')?.setValue(this.folioFiscal);
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
