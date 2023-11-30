import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DetallePago, MetodoPago} from "../../modelos/detallePago.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {ModificarTipoPagoComponent} from "../modificar-tipo-pago/modificar-tipo-pago.component";
import {EliminarTipoPagoComponent} from "../eliminar-tipo-pago/eliminar-tipo-pago.component";

interface ParametrosModificar {
  metodoPago: string,
  tipoPago: string,
  importe: number,
  idPagoDetalle: number
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
      metodoPago: this.pagoSeleccionado.metodoPago, importe: this.pagoSeleccionado.importe,
      tipoPago: this.registroPago.tipoPago, idPagoDetalle: this.pagoSeleccionado.idPagoDetalle
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
