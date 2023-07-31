import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-eliminar-pago',
  templateUrl: './modal-eliminar-pago.component.html',
  styleUrls: ['./modal-eliminar-pago.component.scss']
})
export class ModalEliminarPagoComponent implements OnInit {

  constructor(public readonly ref: DynamicDialogRef,
              public readonly config: DynamicDialogConfig,) {
  }

  ngOnInit(): void {
  }

  cerrarModal() {
    this.ref.close(true);
  }

}
