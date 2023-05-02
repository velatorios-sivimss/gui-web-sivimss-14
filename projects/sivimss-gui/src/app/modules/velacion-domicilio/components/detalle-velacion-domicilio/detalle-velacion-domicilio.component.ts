import { Component, OnInit } from '@angular/core';
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {EquipoVelacionInterface} from "../../models/velacion-domicilio.interface";
import {RegistrarEntradaEquipoComponent} from "../registrar-entrada-equipo/registrar-entrada-equipo.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-detalle-velacion-domicilio',
  templateUrl: './detalle-velacion-domicilio.component.html',
  styleUrls: ['./detalle-velacion-domicilio.component.scss'],
  providers: [DialogService]
})
export class DetalleVelacionDomicilioComponent implements OnInit {

  registrarEntradaEquipoRef!: DynamicDialogRef;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  equipo: EquipoVelacionInterface[] = [
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    }
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
  }

  registrarEquipoEntrada(): void {
    this.registrarEntradaEquipoRef = this.dialogService.open(RegistrarEntradaEquipoComponent,{
      header:'Registro de entrada de equipo',
      width:'920px',
    });
  }

  aceptar(): void {

  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

}
