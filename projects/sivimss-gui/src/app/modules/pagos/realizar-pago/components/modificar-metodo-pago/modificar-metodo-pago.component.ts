import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {ModificarTipoPagoComponent} from "../modificar-tipo-pago/modificar-tipo-pago.component";
import {EliminarTipoPagoComponent} from "../eliminar-tipo-pago/eliminar-tipo-pago.component";

interface DetallePago {
  folio: string,
  metodosPago: MetodoPago[],
  totalAPagar: number
  totalPagado: number
  totalPorCubrir: number,
  estatusPago: string,
  tipoPago: string
}

interface MetodoPago {
  fechaPago: string
  idPagoDetalle: number
  importe: number
  metodoPago: string
  nomBanco: string
  numAutorizacion: string
}

@Component({
  selector: 'app-modificar-metodo-pago',
  templateUrl: './modificar-metodo-pago.component.html',
  styleUrls: ['./modificar-metodo-pago.component.scss'],
  providers: [DialogService]
})
export class ModificarMetodoPagoComponent implements OnInit {

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
    console.log(this.pagoSeleccionado);
  }

  modificarTipoPago(): void {
    const data = {
      metodoPago: this.pagoSeleccionado.metodoPago, importe: this.pagoSeleccionado.importe,
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
  }

  cancelarTipoPago(): void {
    const data = {
      metodoPago: this.pagoSeleccionado.metodoPago, importe: this.pagoSeleccionado.importe,
      tipoPago: this.registroPago.tipoPago
    };
    const CANCELAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Cancelar pago",
      width: MAX_WIDTH,
      data
    };
    this.dialogService.open(EliminarTipoPagoComponent, CANCELAR_TIPO_PAGO_CONFIG);
  }
}
