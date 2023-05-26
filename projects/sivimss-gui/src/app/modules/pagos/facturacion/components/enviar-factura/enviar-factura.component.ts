import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-enviar-factura',
  templateUrl: './enviar-factura.component.html',
  styleUrls: ['./enviar-factura.component.scss']
})
export class EnviarFacturaComponent implements OnInit {

  enviarForm!: FormGroup;
  indice: number = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

  guardar(): void {
    if (this.indice === 0) {
      this.indice++;
      return;
    }
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
  }
}
