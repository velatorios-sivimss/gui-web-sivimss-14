import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalle-solicitud-mantenimiento',
  templateUrl: './detalle-solicitud-mantenimiento.component.html',
  styleUrls: ['./detalle-solicitud-mantenimiento.component.scss']
})
export class DetalleSolicitudMantenimientoComponent implements OnInit {
  data = [{ rin: 38, precision: 38 },{ rin: 38, precision: 38 },{ rin: 38, precision: 38 },{ rin: 38, precision: 38 }];
  constructor() { }

  ngOnInit(): void {
  }

}
