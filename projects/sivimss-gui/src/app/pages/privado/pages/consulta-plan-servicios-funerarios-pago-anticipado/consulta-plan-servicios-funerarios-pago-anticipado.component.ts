import { Component, OnInit } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';

@Component({
  selector: 'app-consulta-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './consulta-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './consulta-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
})
export class ConsultaPlanServiciosFunerariosPagoAnticipadoComponent
  implements OnInit
{
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

  convenios: any[] = [
    {
      id: 1,
      curp: 'GAPJ850415HDFXXXD0',
      folioConvenio: 'DOC-CRE-6-2',
      nombreTitularSubstituto: 'Paola Jimenez Carrasco',
      nombreTitular: 'Irma Jimenez Loranca',
    },
    {
      id: 2,
      curp: 'GAPJ850415HDFXXXD0',
      folioConvenio: 'DOC-CRE-6-2',
      nombreTitularSubstituto: 'Paola Jimenez Carrasco',
      nombreTitular: 'Irma Jimenez Loranca',
    },
    {
      id: 3,
      curp: 'GAPJ850415HDFXXXD0',
      folioConvenio: 'DOC-CRE-6-2',
      nombreTitularSubstituto: 'Paola Jimenez Carrasco',
      nombreTitular: 'Irma Jimenez Loranca',
    },
    {
      id: 4,
      curp: 'GAPJ850415HDFXXXD0',
      folioConvenio: 'DOC-CRE-6-2',
      nombreTitularSubstituto: 'Paola Jimenez Carrasco',
      nombreTitular: 'Irma Jimenez Loranca',
    },
  ];

  totalElementos: number = this.convenios.length;
  mostrarModalFaltaConvenio: boolean = false;
  constructor() {}

  ngOnInit(): void {}
}
