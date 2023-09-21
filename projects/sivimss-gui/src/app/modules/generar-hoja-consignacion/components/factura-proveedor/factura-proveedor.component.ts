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

  get apf() {
    return this.generarHojaConsignacionForm.controls;
  }
}
