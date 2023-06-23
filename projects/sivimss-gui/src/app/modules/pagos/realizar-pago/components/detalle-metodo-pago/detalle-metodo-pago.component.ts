import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

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
  selector: 'app-detalle-metodo-pago',
  templateUrl: './detalle-metodo-pago.component.html',
  styleUrls: ['./detalle-metodo-pago.component.scss']
})
export class DetalleMetodoPagoComponent implements OnInit {

  registroPago!: DetallePago;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

  redireccionPago(): void {
    if (this.registroPago.tipoPago === 'Orden de Servicio') {
      void this.router.navigate(["./../../pago-orden-servicio"], {relativeTo: this.activatedRoute});
      return;
    }
    if (this.registroPago.tipoPago === 'Nuevos Convenios de Previsión Funeraria') {
      void this.router.navigate(["./../../pago-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
      return;
    }
    void this.router.navigate(["./../../pago-renovacion-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
  }

}
