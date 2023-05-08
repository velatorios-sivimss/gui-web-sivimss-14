import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {REALIZAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {REGISTROS_PAGOS} from "../../constants/dummies";
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.scss']
})
export class RealizarPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  filtroForm!: FormGroup;
  catalogoNiveles: TipoDropdown[] = [];
  velatorios: TipoDropdown[] = [];
  pagos: any[] = REGISTROS_PAGOS;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(REALIZAR_PAGO_BREADCRUMB);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}, []],
      velatorio: [{value: null, disabled: false}, []],
      folioOrden: [{value: null, disabled: false}, []],
      folioConvenio: [{value: null, disabled: false}, []],
      folioRenovacion: [{value: null, disabled: false}, []],

    })
  }

  buscar(): void {

  }

  limpiar(): void {

  }

  abrirModalPago(): void {

  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
  }

  abrirModalDetallePago(pago: any): void {

  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);

  }

  guardarPDF(): void {

  }

  guardarExcel(): void {

  }
}
