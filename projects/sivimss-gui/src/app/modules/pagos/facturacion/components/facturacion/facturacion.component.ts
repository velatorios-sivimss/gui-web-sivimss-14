import {Component, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {LazyLoadEvent} from "primeng/api";
import {FACTURACION_BREADCRUMB} from "../../constants/breadcrumb";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {VerDetalleFacturaComponent} from "../ver-detalle-factura/ver-detalle-factura.component";

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.scss'],
  providers: [DialogService]
})
export class FacturacionComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  detalleRef!: DynamicDialogRef;

  velatorios: TipoDropdown[] = [];
  filtroForm!: FormGroup;
  registros: any[] = [
    {
      velatorio: 'No. 14 San Luis Potosí y CD Valles',
      folio: 'DOC-000001',
      folioFactura: 'DOC-000002',
      fechaFactura: '01/01/2022',
      folioFiscal: 'DOC-000002',
      estatus: 'Facturada'
    }
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(FACTURACION_BREADCRUMB);
    this.inicializarFiltroForm();
  }

  private inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}],
      ods: [{value: null, disabled: false}],
      folioConvenio: [{value: null, disabled: false}],
      numeroPermiso: [{value: null, disabled: false}],
      folioFactura: [{value: null, disabled: false}],
      folioFiscal: [{value: null, disabled: false}],
      rfc: [{value: null, disabled: false}],
      periodoInicio: [{value: null, disabled: false}],
      periodoFin: [{value: null, disabled: false}],
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
  }

  limpiarFiltros(): void {

  }

  abrirPanel(event: MouseEvent, registro: any): void {
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleFacturacion(): void {
    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: "Ver detalle",
      width: MAX_WIDTH,
    }
    this.detalleRef = this.dialogService.open(VerDetalleFacturaComponent, DETALLE_CONFIG);
  }

  guardarPDF(): void {

  }

  guardarExcel(): void {

  }
}
