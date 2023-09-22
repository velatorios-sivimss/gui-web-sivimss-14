import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-eliminar-articulo',
  templateUrl: './eliminar-articulo.component.html',
  styleUrls: ['./eliminar-articulo.component.scss']
})
export class EliminarArticuloComponent {

  constructor(private readonly referencia: DynamicDialogRef) { }

  cancelar(): void {
    this.referencia.close(false);
  }

  aceptar(): void {
    this.referencia.close(true);
  }

}
