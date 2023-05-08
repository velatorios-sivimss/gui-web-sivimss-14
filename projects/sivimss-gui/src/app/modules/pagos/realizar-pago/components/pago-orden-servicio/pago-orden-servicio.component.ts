import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {REGISTROS_PAGOS_ODS, TIPO_PAGO_CATALOGOS_ODS} from "../../constants/dummies";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {RegistrarTipoPagoComponent} from "../registrar-tipo-pago/registrar-tipo-pago.component";

@Component({
  selector: 'app-pago-orden-servicio',
  templateUrl: './pago-orden-servicio.component.html',
  styleUrls: ['./pago-orden-servicio.component.scss'],
  providers: [DialogService]
})
export class PagoOrdenServicioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  pagos: any[] = REGISTROS_PAGOS_ODS;
  pagoODSModal: boolean = false;
  tipoPago: TipoDropdown[] = TIPO_PAGO_CATALOGOS_ODS;
  tipoPagoSeleccionado: string = ""
  pagoForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, public dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.inicializarFormPago();
  }

  inicializarFormPago(): void {
    this.pagoForm = this.formBuilder.group({
      tipoPago: [{value: null, disabled: false}]
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);
  }

  registrarPago(): void {
    this.pagoODSModal = !this.pagoODSModal;
  }

  abrirModalPago(): void {
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG)
  }
}
