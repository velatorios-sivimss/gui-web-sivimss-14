import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

interface RegistroRecibo {
  idPagoLinea: number,
  claveCliente: string,
  nomUsuario: string,
  numCon: string,
  conPago: string,
  impPagado: number,
  referencia: string,
  numAprobacion: string,
  folioPago: string,
  numTarjeta: string,
  emisorTarjeta: string,
  fecTransaccion: string,
  idDelegacion: number,
  nomDelegacion: string,
  idVelatorio: number,
  nomVelatorio: string
}

@Component({
  selector: 'app-recibo-pago-linea',
  templateUrl: './recibo-pago-linea.component.html',
  styleUrls: ['./recibo-pago-linea.component.scss']
})
export class ReciboPagoLineaComponent implements OnInit {

  recibo!: RegistroRecibo

  constructor(private readonly activatedRoute: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.recibo = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

}
