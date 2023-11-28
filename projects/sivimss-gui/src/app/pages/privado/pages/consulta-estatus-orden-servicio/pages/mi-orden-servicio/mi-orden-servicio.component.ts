import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mi-orden-servicio',
  templateUrl: './mi-orden-servicio.component.html',
  styleUrls: ['./mi-orden-servicio.component.scss'],
})
export class MiOrdenServicioComponent implements OnInit {
  servicios: any = [
    {
      id: 1,
      servicio: 'Renta de capilla',
      capilla: 'Cristo',
      estatusServicio: 'Pendiente',
      fechaHora: '00-00-0000 00:00',
      notasServicio: 'lorem impsum',
    },
    {
      id: 2,
      servicio: 'Renta de capilla',
      capilla: 'Cristo',
      estatusServicio: 'Pendiente',
      fechaHora: '00-00-0000 00:00',
      notasServicio: 'lorem impsum',
    },
    {
      id: 3,
      servicio: 'Renta de capilla',
      capilla: 'Cristo',
      estatusServicio: 'Pendiente',
      fechaHora: '00-00-0000 00:00',
      notasServicio: 'lorem impsum',
    },
    {
      id: 4,
      servicio: 'Renta de capilla',
      capilla: 'Cristo',
      estatusServicio: 'Pendiente',
      fechaHora: '00-00-0000 00:00',
      notasServicio: 'lorem impsum',
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
