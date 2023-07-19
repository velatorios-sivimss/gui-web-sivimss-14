import {Component, OnInit, ViewChild} from '@angular/core';
import {PagoDetalleGestion} from "../../models/pagoDetalleGestion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {CancelarMetodoPagoComponent} from "../cancelar-metodo-pago/cancelar-metodo-pago.component";
import {MAX_WIDTH} from "../../../../../utils/constantes";
import {ModificarMetodoPagoComponent} from "../modificar-metodo-pago/modificar-metodo-pago.component";

@Component({
  selector: 'app-detalle-gestion-pago',
  templateUrl: './detalle-gestion-pago.component.html',
  styleUrls: ['./detalle-gestion-pago.component.scss'],
  providers: [DialogService]
})
export class DetalleGestionPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  registroPago!: PagoDetalleGestion;
  pagoSeleccionado!: MetodoPagoGestion;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
  ) {
  }

  mostrarOverlay(event: MouseEvent, pago: MetodoPagoGestion): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

  modificarTipoPago(): void {
    const MODIFICAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Modificar pago",
      width: MAX_WIDTH,
      data: this.pagoSeleccionado
    };
    this.dialogService.open(ModificarMetodoPagoComponent, MODIFICAR_TIPO_PAGO_CONFIG);
  }

  cancelarTipoPago(): void {
    const CANCELAR_TIPO_PAGO_CONFIG: DynamicDialogConfig = {
      header: "Cancelar pago",
      width: MAX_WIDTH,
      data: this.pagoSeleccionado
    };
    this.dialogService.open(CancelarMetodoPagoComponent, CANCELAR_TIPO_PAGO_CONFIG);
  }

}
