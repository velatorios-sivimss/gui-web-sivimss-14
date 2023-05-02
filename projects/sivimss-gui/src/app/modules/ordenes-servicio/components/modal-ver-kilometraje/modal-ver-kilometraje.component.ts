import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-ver-kilometraje',
  templateUrl: './modal-ver-kilometraje.component.html',
  styleUrls: ['./modal-ver-kilometraje.component.scss']
})
export class ModalVerKilometrajeComponent implements OnInit {

  dummy!: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
  }

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.dummy = this.config.data.dummy;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }
}
