import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-eliminar-articulo',
  templateUrl: './eliminar-articulo.component.html',
  styleUrls: ['./eliminar-articulo.component.scss']
})
export class EliminarArticuloComponent implements OnInit {

  constructor(private readonly referencia: DynamicDialogRef) { }

  ngOnInit(): void { /* TODO document why this method 'ngOnInit' is empty */ }

  cancelar(): void {
    this.referencia.close(false);
  }

  aceptar(): void {
    this.referencia.close(true);
  }

}
