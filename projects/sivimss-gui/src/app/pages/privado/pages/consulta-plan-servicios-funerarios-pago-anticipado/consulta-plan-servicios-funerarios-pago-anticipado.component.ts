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
export class ConsultaPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  convenios: any[] = [];
  totalElementos: number = this.convenios.length;
  mostrarModalFaltaConvenio: boolean = false;

  ngOnInit(): void {
    if (this.convenios.length === 0) {
      this.mostrarModalFaltaConvenio = true;
    }
  }
}
