import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {ServiciosFunerariosInterface, DetallePago} from "../../models/servicios-funerarios.interface";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {Articulo} from "../../../articulos/models/articulos.interface";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detalle-servicios-funerarios',
  templateUrl: './detalle-servicios-funerarios.component.html',
  styleUrls: ['./detalle-servicios-funerarios.component.scss']
})
export class DetalleServiciosFunerariosComponent implements OnInit {

  @Input() servicioFunerario: ServiciosFunerariosInterface[] = [];

  detallePago: DetallePago[] = [];
  detalleSeleccionado: DetallePago = {};

  @ViewChild(OverlayPanel)
  overlayPanelHeader!: OverlayPanel;

  @ViewChild(OverlayPanel)
  overlayPanelBody!: OverlayPanel;


  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.detallePago = [
        {
          velatorio:"No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio:"No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio:"No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        }
      ];
      this.totalElementos = this.detallePago.length;
    },0)
  }


  abrirPanelHeader(event:MouseEvent):void{
    this.overlayPanelHeader.toggle(event);
  }

  abrirPanelBody(event:MouseEvent,detalleSeleccionado:DetallePago): void{
    this.overlayPanelBody.toggle(event);
  }


}
