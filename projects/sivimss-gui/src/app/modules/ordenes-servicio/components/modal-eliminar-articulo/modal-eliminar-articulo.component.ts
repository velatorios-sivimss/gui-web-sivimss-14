import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-eliminar-articulo',
  templateUrl: './modal-eliminar-articulo.component.html',
  styleUrls: ['./modal-eliminar-articulo.component.scss']
})
export class ModalEliminarArticuloComponent implements OnInit {

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

}
