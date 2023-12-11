import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DetallePago, MetodoPago} from "../../modelos/detallePago.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {ModificarTipoPagoComponent} from "../modificar-tipo-pago/modificar-tipo-pago.component";
import {EliminarTipoPagoComponent} from "../eliminar-tipo-pago/eliminar-tipo-pago.component";

interface ParametrosModificar {
  pago: MetodoPago,
  tipoPago: string,
}

interface ParametrosCancelar {
  pago: MetodoPago,
  total: number
}
@Component({
  selector: 'app-modificar-pago',
  templateUrl: './modificar-pago.component.html',
  styleUrls: ['./modificar-pago.component.scss'],
  providers: [DialogService]
})
export class ModificarPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  registroPago!: DetallePago;
  pagoSeleccionado!: MetodoPago;
  tipoPago: string = '';

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
  ) {
  }

  mostrarOverlay(event: MouseEvent, pago: MetodoPago): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  modificarTipoPago(): void {
    const data: ParametrosModificar = {
      pago: this.pagoSeleccionado,
      tipoPago: this.registroPago.tipoPago
    };
    const MODIFICAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Modificar pago",
      width: MAX_WIDTH,
      data
    };
    this.dialogService.open(ModificarTipoPagoComponent, MODIFICAR_TIPO_PAGO_CONFIG)
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
    this.tipoPago = this.obtenerTipoPago();
  }

  obtenerTipoPago(): string {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return 'la ODS'
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return 'el Nuevo Convenio de Previsión Funeraria';
    }
    return 'la Renovación del Nuevo Convenio de Previsión Funeraria';
  }

  cancelarTipoPago(): void {
    const data: ParametrosCancelar = {
      pago: this.pagoSeleccionado,
      total: this.registroPago.totalAPagar
    };
    const CANCELAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Cancelar pago",
      width: MAX_WIDTH,
      data
    };
    this.dialogService.open(EliminarTipoPagoComponent, CANCELAR_TIPO_PAGO_CONFIG);
  }
}
