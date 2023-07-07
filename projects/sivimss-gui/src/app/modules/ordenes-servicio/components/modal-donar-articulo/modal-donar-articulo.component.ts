import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-donar-articulo',
  templateUrl: './modal-donar-articulo.component.html',
  styleUrls: ['./modal-donar-articulo.component.scss'],
})
export class ModalDonarArticuloComponent implements OnInit {
  ataud: string = '';
  salida: any = {};
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.salida = this.config.data.datos;
    this.ataud = this.config.data.datos;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(null);
  }

  donarAtaud(): void {
    this.salida.esDonado = 1;
    this.salida.proviene = 'paquete';
    this.ref.close(this.salida);
  }
}
