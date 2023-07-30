import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { CATALOGOS_DUMMIES } from "../../../servicios/constants/dummies";

@Component({
  selector: 'app-modal-realizar-pago',
  templateUrl: './modal-realizar-pago.component.html',
  styleUrls: ['./modal-realizar-pago.component.scss']
})
export class ModalRealizarPagoComponent implements OnInit {

  constructor(public readonly ref: DynamicDialogRef,
              public readonly config: DynamicDialogConfig,) {
  }

  ngOnInit(): void {
  }

  cerrarModal() {
    this.ref.close(true);
  }

  protected readonly CATALOGOS_DUMMIES = CATALOGOS_DUMMIES;
}
