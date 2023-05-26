import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { DatosFolioODS } from "../../models/velacion-domicilio.interface";
import { RegistrarEntradaEquipoComponent } from "../registrar-entrada-equipo/registrar-entrada-equipo.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-velacion-domicilio',
  templateUrl: './detalle-velacion-domicilio.component.html',
  styleUrls: ['./detalle-velacion-domicilio.component.scss'],
  providers: [DialogService]
})
export class DetalleVelacionDomicilioComponent implements OnInit {
  readonly POSICION_DETALLE_VALE_SALIDA = 0;

  registrarEntradaEquipoRef!: DynamicDialogRef;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  detalleValeSalida: DatosFolioODS = {
    articulos: []
  };

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.detalleValeSalida = respuesta[this.POSICION_DETALLE_VALE_SALIDA]?.datos;
    this.actualizarBreadcrumb();
  }

  registrarEquipoEntrada(): void {
    this.registrarEntradaEquipoRef = this.dialogService.open(RegistrarEntradaEquipoComponent, {
      header: 'Registro de entrada de equipo',
      width: '920px',
      data: { valeSeleccionado: this.detalleValeSalida.idVelatorio },
    });
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

}
