import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-recibo-pago',
  templateUrl: './recibo-pago.component.html',
  styleUrls: ['./recibo-pago.component.scss']
})
export class ReciboPagoComponent implements OnInit {
  @Input() cveCliente: string = 'Sin Información';
  @Input() nombreUsuario: string = 'Sin Información';
  @Input() numeroConvenio: string = 'Sin Información';
  @Input() conceptoPago: string = 'Sin Información';
  @Input() idPago: string = 'Sin Información';
  @Input() importe: string = 'Sin Información';
  @Input() numAprobacion: string = 'Sin Información';
  @Input() digitos: string = 'Sin Información';
  @Input() emisor: string = 'Sin Información';
  @Input() delegacion: string = 'Sin Información';
  @Input() velatorio: string = 'Sin Información';

  constructor() { }

  ngOnInit(): void {
  }

}
