import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../../utils/constantes";
import {REGISTROS_PAGOS_ODS, TIPO_PAGO_CATALOGOS_CONVENIO} from "../../constants/dummies";
import {LazyLoadEvent} from "primeng/api";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {RegistrarTipoPagoComponent} from "../registrar-tipo-pago/registrar-tipo-pago.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";

@Component({
  selector: 'app-pago-renovacion-convenio',
  templateUrl: './pago-renovacion-convenio.component.html',
  styleUrls: ['./pago-renovacion-convenio.component.scss'],
  providers: [DialogService]
})
export class PagoRenovacionConvenioComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  pagos: any[] = REGISTROS_PAGOS_ODS;
  pagoConvenioModal: boolean = false;
  tipoPago: TipoDropdown[] = TIPO_PAGO_CATALOGOS_CONVENIO;
  pagoForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, public dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.inicializarFormPago();
  }

  inicializarFormPago(): void {
    this.pagoForm = this.formBuilder.group({
      tipoPago: [{value: null, disabled: false}, [Validators.required]]
    })
  }
  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
  }

  abrirPanel(event: MouseEvent, pago: any) {
    this.overlayPanel.toggle(event);
  }

  abrirModalPago(): void {
    this.registrarPago();
    const tipoPago = this.pagoForm.get('tipoPago')?.value;
    const REGISTRAR_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Registrar tipo de pago",
      width: MAX_WIDTH,
      data: tipoPago
    }
    this.dialogService.open(RegistrarTipoPagoComponent, REGISTRAR_PAGO_CONFIG);
  }

  registrarPago(): void {
    this.pagoConvenioModal = !this.pagoConvenioModal;
  }

}