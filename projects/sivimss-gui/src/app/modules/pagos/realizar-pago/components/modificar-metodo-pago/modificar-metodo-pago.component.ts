import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";

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
  styleUrls: ['./modificar-metodo-pago.component.scss']
})
export class ModificarMetodoPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  registroPago!: DetallePago;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  mostrarOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

}
