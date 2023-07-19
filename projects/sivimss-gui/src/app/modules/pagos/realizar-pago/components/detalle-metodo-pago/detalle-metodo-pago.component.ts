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
  styleUrls: ['./detalle-metodo-pago.component.scss'],
})
export class DetalleMetodoPagoComponent implements OnInit {

  registroPago!: DetallePago;
  idPagoBitacora!: number;
  fecha: Date = new Date();
  tipoPago: string = '';

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
    this.tipoPago = this.obtenerTipoPago();
    this.idPagoBitacora = this.activatedRoute.snapshot.paramMap.get('idPagoBitacora') as unknown as number;
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

  redireccionPago(): void {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      void this.router.navigate(["./../../pago-orden-servicio"], {relativeTo: this.activatedRoute});
      return;
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      void this.router.navigate(["./../../pago-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
      return;
    }
    void this.router.navigate(["./../../pago-renovacion-convenio-prevision-funeraria"], {relativeTo: this.activatedRoute});
  }

}
