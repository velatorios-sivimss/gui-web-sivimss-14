import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { ActualizarOrdenServicioService } from '../../services/actualizar-orden-servicio.service';
import { GestionarEtapasActualizacionService } from '../../services/gestionar-etapas-actualizacion.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { finalize } from 'rxjs';

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
    private gestionarEtapasService: GestionarEtapasActualizacionService,
    private rutaActiva: ActivatedRoute,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private changeDetector: ChangeDetectorRef,
    private alertaService: AlertaService
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
    this.buscarDetalle(Number(this.rutaActiva.snapshot.paramMap.get('idODS')));
  }

  buscarDetalle(idODS: number) {
    this.loaderService.activar();

    const parametros = { idOrdenServicio: idODS };
    console.log('entro', parametros);
    this.gestionarOrdenServicioService
      .consultarDetalleODS(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log('que trajo', respuesta);
          this.gestionarEtapasService.datosContratante$.next(respuesta.datos);
          this.gestionarEtapasService.datosConsultaODS$.next(respuesta.datos);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  obtenerIdEtapaSeleccionada(idEtapaSeleccionada: number) {
    //Con esta etapa que se recibe ya se puede modificar su estado.
    //Al modificar el estado de la etapa su estilo se actualiza.
    // this.etapas.forEach((etapa: Etapa) => etapa.estado = EtapaEstado.Inactivo);
    // etapaSeleccionada.estado = EtapaEstado.Activo;
    this.idEtapaSeleccionada = idEtapaSeleccionada;
  }
}
