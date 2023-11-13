import { Component, OnInit } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';

@Component({
  selector: 'app-consulta-estatus-orden-servicio',
  templateUrl: './consulta-estatus-orden-servicio.component.html',
  styleUrls: ['./consulta-estatus-orden-servicio.component.scss'],
})
export class ConsultaEstatusOrdenServicioComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

  ordenesServicios: any[] = [
    {
      id: 1,
      folio: 'DOC-CRE-6-2',
      nombreContratante: 'Paola Jimenez Carrasco',
    },
    {
      id: 2,
      folio: 'DOC-CRE-6-2',
      nombreContratante: 'Paola Jimenez Carrasco',
    },
    {
      id: 3,
      folio: 'DOC-CRE-6-2',
      nombreContratante: 'Paola Jimenez Carrasco',
    },
    {
      id: 4,
      folio: 'DOC-CRE-6-2',
      nombreContratante: 'Paola Jimenez Carrasco',
    },
  ];

  totalElementos: number = this.ordenesServicios.length;
  mostrarModalFaltaConvenio: boolean = false;
  constructor() {}

  ngOnInit(): void {}
}
