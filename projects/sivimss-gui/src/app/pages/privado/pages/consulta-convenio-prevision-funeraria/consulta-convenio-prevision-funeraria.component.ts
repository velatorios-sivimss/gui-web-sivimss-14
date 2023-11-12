import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { ModalDetalleBeneficiariosComponent } from './pages/mi-convenio-prevision-funeraria/components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';

@Component({
  selector: 'app-consulta-convenio-prevision-funeraria',
  templateUrl: './consulta-convenio-prevision-funeraria.component.html',
  styleUrls: ['./consulta-convenio-prevision-funeraria.component.scss'],
})
export class ConsultaConvenioPrevisionFunerariaComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

  convenios: any[] = [
    {
      id: 1,
      folio: 'DOC-CRE-6-2',
      nombreAfiliado: 'Irma Jimenez Loranca',
      curp: 'GAPJ850415HDFXXXD0',
    },
    {
      id: 2,
      folio: 'DOC-CRE-6-3',
      nombreAfiliado: 'Juan Pérez García',
      curp: 'PEPJ901101MCMXXXD1',
    },
    {
      id: 3,
      folio: 'DOC-CRE-6-4',
      nombreAfiliado: 'María Sánchez Rodríguez',
      curp: 'SAMM950302HDFXXXD2',
    },
    {
      id: 4,
      folio: 'DOC-CRE-6-5',
      nombreAfiliado: 'Luis Rodríguez Pérez',
      curp: 'ROLJ880521MTLXXXD3',
    },
    {
      id: 5,
      folio: 'DOC-CRE-6-6',
      nombreAfiliado: 'Ana María García López',
      curp: 'GAAL910713GDFXXXD4',
    },
    {
      id: 6,
      folio: 'DOC-CRE-6-7',
      nombreAfiliado: 'Pedro López Martínez',
      curp: 'LOPP840819MSPXXXD5',
    },
    {
      id: 7,
      folio: 'DOC-CRE-6-8',
      nombreAfiliado: 'Laura Fernández Gómez',
      curp: 'FELA870624HDFXXXD6',
    },
    {
      id: 8,
      folio: 'DOC-CRE-6-9',
      nombreAfiliado: 'Miguel Torres Sánchez',
      curp: 'TOMM900410MSPXXXD7',
    },
    {
      id: 9,
      folio: 'DOC-CRE-6-10',
      nombreAfiliado: 'Isabel Gómez Ramírez',
      curp: 'GOPI930705MDFXXXD8',
    },
    {
      id: 10,
      folio: 'DOC-CRE-6-11',
      nombreAfiliado: 'Carlos Ramírez Pérez',
      curp: 'RACA820319HSPXXXD9',
    },
    {
      id: 11,
      folio: 'DOC-CRE-6-12',
      nombreAfiliado: 'Patricia Martínez García',
      curp: 'MAPA910527HDFXXXE0',
    },
    {
      id: 12,
      folio: 'DOC-CRE-6-13',
      nombreAfiliado: 'Roberto González Sánchez',
      curp: 'GORO880712MDFXXXE1',
    },
  ];

  totalElementos: number = this.convenios.length;
  mostrarModalFaltaConvenio: boolean = false;
  mostrarModalNoPuedeRenovar: boolean = false;
  mostrarModalNoSeEncuentraEnPeriodo: boolean = false;

  ngOnInit(): void {}
}
