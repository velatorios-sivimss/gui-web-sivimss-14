import { Component, OnInit } from '@angular/core';
import { EtapaEstado } from "projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum";
import { Etapa } from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';

@Component({
  selector: 'app-generar-orden-servicio',
  templateUrl: './generar-orden-servicio.component.html',
  styleUrls: ['./generar-orden-servicio.component.scss']
})
export class GenerarOrdenServicioComponent implements OnInit {

  readonly DATOS_DEL_CONTRATANTE = 0;
  readonly DATOS_DEL_FINADO = 1;
  readonly CARACTERISTICAS_DEL_PRESUPUESTO = 2;
  readonly INFORMACION_DEL_SERVICIO = 3;


  // etapas: Etapa[] = [
  //   {
  //     idEtapa: 0,
  //     estado: EtapaEstado.Activo,
  //     textoInterior: '1',
  //     textoExterior: 'Datos del contratante',
  //     lineaIzquierda: {
  //       mostrar: false,
  //       estilo: "solid"
  //     },
  //     lineaDerecha: {
  //       mostrar: true,
  //       estilo: "solid"
  //     }
  //   },
  //   {
  //     idEtapa: 1,
  //     estado: EtapaEstado.Inactivo,
  //     textoInterior: '2',
  //     textoExterior: 'Datos del finado',
  //     lineaIzquierda: {
  //       mostrar: true,
  //       estilo: "solid"
  //     },
  //     lineaDerecha: {
  //       mostrar: true,
  //       estilo: "solid"
  //     }
  //   },
  //   {
  //     idEtapa: 2,
  //     estado: EtapaEstado.Inactivo,
  //     textoInterior: '3',
  //     textoExterior: 'Características del presupuesto',
  //     lineaIzquierda: {
  //       mostrar: true,
  //       estilo: "solid"
  //     },
  //     lineaDerecha: {
  //       mostrar: true,
  //       estilo: "solid"
  //     }
  //   },
  //   {
  //     idEtapa: 3,
  //     estado: EtapaEstado.Inactivo,
  //     textoInterior: '4',
  //     textoExterior: 'Información del servicio',
  //     lineaIzquierda: {
  //       mostrar: true,
  //       estilo: "solid"
  //     },
  //     lineaDerecha: {
  //       mostrar: false,
  //       estilo: "solid"
  //     }
  //   }
  // ];

  idEtapaSeleccionada: number = 0;

  constructor(
    private gestionarEtapasService: GestionarEtapasService
  ) {
  }

  ngOnInit(): void {
    // this.gestionarEtapasService.etapas$.next(this.etapas);
  }

  obtenerIdEtapaSeleccionada(idEtapaSeleccionada: number) {
    //Con esta etapa que se recibe ya se puede modificar su estado.
    //Al modificar el estado de la etapa su estilo se actualiza.
    // this.etapas.forEach((etapa: Etapa) => etapa.estado = EtapaEstado.Inactivo);
    // etapaSeleccionada.estado = EtapaEstado.Activo;
    this.idEtapaSeleccionada = idEtapaSeleccionada;
  }


}
