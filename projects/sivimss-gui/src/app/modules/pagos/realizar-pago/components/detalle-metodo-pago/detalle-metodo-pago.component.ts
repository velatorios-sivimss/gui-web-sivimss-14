import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DetallePago} from "../../modelos/detallePago.interface";

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
  generarPagare: boolean = false;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
    this.tipoPago = this.obtenerTipoPago();
    this.titulo = this.obtenerTipoPago();
    this.tipoFolio = this.obtenerFolioTipoPago();
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
