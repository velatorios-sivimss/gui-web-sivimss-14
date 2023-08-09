import {Component, OnInit} from '@angular/core';
import {PagoDetalleGestion} from "../../models/pagoDetalleGestion.interface";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-ir-a-pago',
  templateUrl: './ir-a-pago.component.html',
  styleUrls: ['./ir-a-pago.component.scss']
})
export class IrAPagoComponent implements OnInit {

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
