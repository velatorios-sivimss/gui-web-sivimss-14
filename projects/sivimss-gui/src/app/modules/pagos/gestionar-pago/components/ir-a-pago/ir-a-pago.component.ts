import {Component, OnInit} from '@angular/core';
import {PagoDetalleGestion} from "../../models/pagoDetalleGestion.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogService} from "primeng/dynamicdialog";

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
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.registroPago = this.activatedRoute.snapshot.data["respuesta"].datos;
  }

}
