import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cancelar-orden-entrada',
  templateUrl: './cancelar-orden-entrada.component.html',
  styleUrls: ['./cancelar-orden-entrada.component.scss']
})
export class CancelarOrdenEntradaComponent implements OnInit {
  mostrarModalCancelarODE:boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
