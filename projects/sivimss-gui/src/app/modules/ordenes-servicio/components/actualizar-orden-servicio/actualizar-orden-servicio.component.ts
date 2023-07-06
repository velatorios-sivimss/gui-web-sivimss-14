import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';

@Component({
  selector: 'app-actualizar-orden-servicio',
  templateUrl: './actualizar-orden-servicio.component.html',
  styleUrls: ['./actualizar-orden-servicio.component.scss'],
})
export class ActualizarOrdenServicioComponent implements OnInit {
  readonly DATOS_DEL_CONTRATANTE = 0;
  readonly DATOS_DEL_FINADO = 1;
  readonly CARACTERISTICAS_DEL_PRESUPUESTO = 2;
  readonly INFORMACION_DEL_SERVICIO = 3;

  titulo: string = '';

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
    private gestionarEtapasService: GestionarEtapasService,
    private rutaActiva: ActivatedRoute,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.gestionarEtapasService.etapas$.next(this.etapas);
    let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    console.log(estatus);
    if (Number(estatus) == 1) {
      this.titulo = 'ACTUALIZAR ORDEN DE SERVICIO';
    } else {
      this.titulo = 'GENERAR ORDEN COMPLEMENTARIA';
    }
  }

  obtenerIdEtapaSeleccionada(idEtapaSeleccionada: number) {
    //Con esta etapa que se recibe ya se puede modificar su estado.
    //Al modificar el estado de la etapa su estilo se actualiza.
    // this.etapas.forEach((etapa: Etapa) => etapa.estado = EtapaEstado.Inactivo);
    // etapaSeleccionada.estado = EtapaEstado.Activo;
    this.idEtapaSeleccionada = idEtapaSeleccionada;
  }
}
