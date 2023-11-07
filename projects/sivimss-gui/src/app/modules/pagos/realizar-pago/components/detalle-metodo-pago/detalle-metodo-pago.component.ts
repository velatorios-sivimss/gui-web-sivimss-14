import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DetallePago} from "../../modelos/detallePago.interface";
import {Location} from "@angular/common";

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
  tipoFolio: string = '';
  titulo: string = '';
  fechaPago: string = '';

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
    this.tipoPago = this.obtenerTipoPago();
    this.titulo = this.obtenerTipoPago();
    this.tipoFolio = this.obtenerFolioTipoPago();
    const ultimaFecha: number = this.registroPago.metodosPago.length - 1;
    this.fechaPago = this.registroPago.metodosPago[ultimaFecha].fechaPago;
    this.idPagoBitacora = this.activatedRoute.snapshot.paramMap.get('idPagoBitacora') as unknown as number;
  }

  obtenerFolioTipoPago(): string {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return 'Folio ODS'
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return 'Folio NCPF';
    }
    return 'Folio PRCPF';
  }

  obtenerTipoPago(): string {
    if (this.registroPago.tipoPago === 'Pago de Orden de Servicio') {
      return 'Pago de orden de servicio'
    }
    if (this.registroPago.tipoPago === 'Pago de Nuevos Convenios de Previsión Funeraria') {
      return 'Pago de Nuevos convenios de previsión funeraria';
    }
    return 'Pago de Renovación de convenios de previsión funeraria';
  }

  regresarPaginaPrevia(): void {
    this.location.back();
  }

}
