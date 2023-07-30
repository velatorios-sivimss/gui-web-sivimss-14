import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import { ModalVerKilometrajeComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-kilometraje/modal-ver-kilometraje.component";
import { ModalEliminarPagoComponent } from "projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-eliminar-pago/modal-eliminar-pago.component";
import { ModalRealizarPagoComponent } from "projects/sivimss-gui/src/app/modules/servicios-funerarios/components/modal-realizar-pago/modal-realizar-pago.component";
import { ServiciosFunerariosInterface, DetallePago } from "../../models/servicios-funerarios.interface";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { LazyLoadEvent } from "primeng/api";
import { Articulo } from "../../../articulos/models/articulos.interface";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-detalle-servicios-funerarios',
  templateUrl: './detalle-servicios-funerarios.component.html',
  styleUrls: ['./detalle-servicios-funerarios.component.scss'],
  providers: [
    DialogService
  ]
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
    private dialogService: DialogService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.detallePago = [
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        },
        {
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          pagos: "1/3",
          fechaPago: "01/01/2022",
          metodoPago: "Tarjeta de débito",
          noReciboPago: 10293847456,
          estatus: "Pagado",
          monto: 11000
        }
      ];
      this.totalElementos = this.detallePago.length;
    }, 0)
  }


  abrirPanelHeader(event: MouseEvent): void {
    this.overlayPanelHeader.toggle(event);
  }

  abrirPanelBody(event: MouseEvent, detalleSeleccionado: DetallePago): void {
    this.overlayPanelBody.toggle(event);
  }

  abrirModalRealizarPago(): void {
    const ref = this.dialogService.open(ModalRealizarPagoComponent, {
      header: 'Realizar pago',
      style: {
        maxWidth: '876px',
        width: '100%'
      },
      data: {
        dummy: '', //Pasa info
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal
      }
    });
  }

  abrirModalEliminarPago(): void {
    const ref = this.dialogService.open(ModalEliminarPagoComponent, {
      header: 'Eliminar pago',
      style: {
        maxWidth: '876px',
        width: '100%'
      },
      data: {
        dummy: '', //Pasa info
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal
      }
    });
  }


}
