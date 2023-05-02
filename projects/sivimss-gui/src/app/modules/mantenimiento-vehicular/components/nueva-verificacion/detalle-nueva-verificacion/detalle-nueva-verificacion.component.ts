import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-detalle-nueva-verificacion',
  templateUrl: './detalle-nueva-verificacion.component.html',
  styleUrls: ['./detalle-nueva-verificacion.component.scss']
})
export class DetalleNuevaVerificacionComponent implements OnInit {

  data = [{rin: 38, precision: 38}, {rin: 38, precision: 38}, {rin: 38, precision: 38}, {rin: 38, precision: 38}];

  constructor() {
  }

  ngOnInit(): void {
  }

}
