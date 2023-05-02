import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-agregar-al-paquete',
  templateUrl: './modal-agregar-al-paquete.component.html',
  styleUrls: ['./modal-agregar-al-paquete.component.scss']
})
export class ModalAgregarAlPaqueteComponent implements OnInit {

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

}
