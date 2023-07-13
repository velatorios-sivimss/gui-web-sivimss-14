import {Component, OnInit, ViewChild} from '@angular/core';
import {PagoDetalleGestion} from "../../models/pagoDetalleGestion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {MetodoPagoGestion} from "../../models/metodoPagoGestion.interface";

@Component({
  selector: 'app-detalle-gestion-pago',
  templateUrl: './detalle-gestion-pago.component.html',
  styleUrls: ['./detalle-gestion-pago.component.scss']
})
export class DetalleGestionPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  registroPago!: PagoDetalleGestion;
  pagoSeleccionado!: MetodoPagoGestion;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  mostrarOverlay(event: MouseEvent, pago: MetodoPagoGestion): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
    console.log(this.pagoSeleccionado);
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

}
