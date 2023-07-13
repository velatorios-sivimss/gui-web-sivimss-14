import {Component, OnInit} from '@angular/core';
import {PagoDetalleGestion} from "../../models/pagoDetalleGestion.interface";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-detalle-gestion-pago',
  templateUrl: './detalle-gestion-pago.component.html',
  styleUrls: ['./detalle-gestion-pago.component.scss']
})
export class DetalleGestionPagoComponent implements OnInit {

  registroPago!: PagoDetalleGestion;

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

}
