import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-modal-modal-ver-tarjeta-identificacion',
  templateUrl: './modal-ver-tarjeta-identificacion.component.html',
  styleUrls: ['./modal-ver-tarjeta-identificacion.component.scss']
})
export class ModalVerTarjetaIdentificacionComponent implements OnInit {

  dummy!: string;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
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
