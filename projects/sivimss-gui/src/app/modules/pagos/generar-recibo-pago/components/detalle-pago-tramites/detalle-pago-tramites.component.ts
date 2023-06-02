import {Component, OnInit} from '@angular/core';
import {DetalleReciboPago} from "../../models/detalleReciboPago.interface";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detalle-pago-tramites',
  templateUrl: './detalle-pago-tramites.component.html',
  styleUrls: ['./detalle-pago-tramites.component.scss']
})
export class DetallePagoTramitesComponent implements OnInit {

  recibo!: DetalleReciboPago
  mes: string = '';
  dia: string = '';
  anio: string = '';

  constructor(
    private route: ActivatedRoute,
  ) {
    this.recibo = this.route.snapshot.data["respuesta"].datos[0];
    this.obtenerValoresFecha();
  }

  ngOnInit(): void {
  }

  obtenerValoresFecha(): void {
    const fecha: Date = new Date(this.diferenciaUTCGuion(this.recibo.fecha));
    this.dia = fecha.getDate().toString();
    this.mes = fecha.toLocaleString('default', {month: 'long'});
    this.anio = fecha.getFullYear().toString();
  }

  diferenciaUTCGuion(fecha: string): number {
    const [anio, mes, dia]: string[] = fecha.split("-");
    const objetoFecha: Date = new Date(+anio, +mes - 1, +dia);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }
}
