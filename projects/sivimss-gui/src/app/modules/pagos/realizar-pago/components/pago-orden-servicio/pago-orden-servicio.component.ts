import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {REGISTROS_PAGOS_ODS} from "../../constants/dummies";

@Component({
  selector: 'app-pago-orden-servicio',
  templateUrl: './pago-orden-servicio.component.html',
  styleUrls: ['./pago-orden-servicio.component.scss']
})
export class PagoOrdenServicioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  pagos: any[] = REGISTROS_PAGOS_ODS;

  constructor() {
  }

  ngOnInit(): void {
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
  }

  abrirPanel(event: MouseEvent, pago: any) {
    this.overlayPanel.toggle(event);

  }
}
