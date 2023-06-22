import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

interface DetallePago {
  folio: string,
  metodosPago: MetodoPago[],
  totalAPagar: number
  totalPagado: number
  totalPorCubrir: number
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
  selector: 'app-detalle-metodo-pago',
  templateUrl: './detalle-metodo-pago.component.html',
  styleUrls: ['./detalle-metodo-pago.component.scss']
})
export class DetalleMetodoPagoComponent implements OnInit {

  registroPago!: DetallePago;

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.route.snapshot.data["respuesta"].datos;
  }

}
