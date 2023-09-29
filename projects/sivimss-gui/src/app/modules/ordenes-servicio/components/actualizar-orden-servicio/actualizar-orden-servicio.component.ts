import {ChangeDetectorRef, Component, OnInit, OnDestroy} from '@angular/core';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {ActivatedRoute} from '@angular/router';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ActualizarOrdenServicioService} from '../../services/actualizar-orden-servicio.service';
import {GestionarEtapasActualizacionService} from '../../services/gestionar-etapas-actualizacion.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {Subscription, finalize} from 'rxjs';

@Component({
  selector: 'app-actualizar-orden-servicio',
  templateUrl: './actualizar-orden-servicio.component.html',
  styleUrls: ['./actualizar-orden-servicio.component.scss'],
})
export class ActualizarOrdenServicioComponent implements OnInit, OnDestroy {
  readonly DATOS_DEL_CONTRATANTE = 0;
  readonly DATOS_DEL_FINADO = 1;
  readonly CARACTERISTICAS_DEL_PRESUPUESTO = 2;
  readonly INFORMACION_DEL_SERVICIO = 3;

  titulo: string = '';

  subscription!: Subscription;
  etapas: Etapa[] = [];

  idEtapaSeleccionada: number = 0;
  estatusValida: number = 0;

  constructor(
    private gestionarEtapasService: GestionarEtapasActualizacionService,
    private rutaActiva: ActivatedRoute,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private changeDetector: ChangeDetectorRef,
    private alertaService: AlertaService
  ) {
    this.buscarDetalle(Number(this.rutaActiva.snapshot.queryParams.idODS));
  }

  ngOnInit(): void {
    let estatus = this.rutaActiva.snapshot.queryParams.idEstatus;

    if (Number(estatus) == 1) {
      this.estatusValida = 1;
      this.titulo = 'MODIFICAR ORDEN DE SERVICIO';
    } else {
      this.titulo = 'GENERAR ORDEN COMPLEMENTARIA';
    }

    this.etapas = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 2,
        estado: (Number(estatus) == 1) ? EtapaEstado.Completado : EtapaEstado.Inactivo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: (Number(estatus) == 1) ? "dashed" : "solid"
        }
      },
      {
        idEtapa: 3,
        estado: (Number(estatus) == 1) ? EtapaEstado.Completado : EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: (Number(estatus) == 1) ? "dashed" : "solid"
        },
        lineaDerecha: {
          mostrar: false,
          estilo: (Number(estatus) == 1) ? "dashed" : "solid"
        }
      }
    ];
    this.gestionarEtapasService.etapas$.next(this.etapas);
  }

  buscarDetalle(idODS: number) {
    this.loaderService.activar();

    const parametros = {idOrdenServicio: idODS};
    this.gestionarOrdenServicioService
      .consultarDetalleODS(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (this.estatusValida == 1) {
            this.caracteristicas(respuesta.datos);
            if (respuesta.datos.informacionServicio != null)
              this.datosInformacionServicio(
                respuesta.datos.informacionServicio
              );
          }
          this.gestionarEtapasService.datosContratante$.next(respuesta.datos);
          this.gestionarEtapasService.datosConsultaODS$.next(respuesta.datos);
        },
        error: (error: HttpErrorResponse): void => {
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
      });
  }

  caracteristicas(datos: any): void {
    let datosPaquete = datos.caracteristicasPresupuesto;
    let presupuesto = datosPaquete.caracteristicasDelPresupuesto;

    let observaciones = null;

    let notasServicio = null;
    let idPaquete = null;
    let otorgamiento = null;
    let mostrarOtorgamiento = false;
    let salidaPaquete = [];
    let salidaPresupuesto = [];
    if (datosPaquete != null && datosPaquete.caracteristicasPaqueteResponse != null && datosPaquete.caracteristicasDelPresupuesto != null) {
      let caracteristicasPaquete = datosPaquete.caracteristicasPaqueteResponse;
      observaciones = datosPaquete.caracteristicasDelPresupuesto.observaciones;
      notasServicio = datosPaquete.caracteristicasDelPresupuesto.notasServicio;
      let paquete = caracteristicasPaquete.detallePaquete;
      idPaquete = datosPaquete.caracteristicasPaqueteResponse.idPaquete;
      otorgamiento = Number(caracteristicasPaquete.otorgamiento);
      if (otorgamiento > 0) {
        mostrarOtorgamiento = true;
      }
      for (let element of paquete) {
        let coordOrigen = null;
        let coordDestino = null;
        let destino = null;
        let origen = null;
        let totalKilometros = null;
        if (element.servicioDetalleTraslado != null) {
          coordOrigen = [
            element.servicioDetalleTraslado.latitudInicial,
            element.servicioDetalleTraslado.longitudInicial,
          ];
          coordDestino = [
            element.servicioDetalleTraslado.latitudFinal,
            element.servicioDetalleTraslado.longitudFinal,
          ];
          destino = element.servicioDetalleTraslado.destino;
          origen = element.servicioDetalleTraslado.origen;
          totalKilometros = element.servicioDetalleTraslado.totalKilometros;
        }

        let bloquearRadioButton = true;
        if (element.idProveedor == null || element.idProveedor == '') {
          bloquearRadioButton = false;
        }
        let datos = {
          idCategoriaPaquete: element.idCategoria,
          idPaqueteDetalle: element.idPaqueteDetalle,
          grupo: element.grupo,
          concepto: element.concepto,
          totalPaquete: element.totalPaquete,
          idServicio: element.idServicio,
          cantidad: element.cantidad,
          idArticulo: element.idArticulo,
          idCategoria: element.idCategoria,
          importe: element.importeMonto,
          idTipoServicio: element.idTipoServicio,
          idInventario: element.idInventario,
          proveedor: element.nombreProveedor,
          idProveedor: element.idProveedor,
          kilometraje: element.kilometraje,
          coordOrigen: coordOrigen,
          coordDestino: coordDestino,
          destino: destino,
          origen: origen,
          utilizarArticulo: element.agregado,
          bloquearRadioButton: bloquearRadioButton,
          proviene: null,
          totalKilometros: totalKilometros,
        };
        salidaPaquete.push(datos);
      }
    }

    let total = 0;
    if (presupuesto != null) {
      let detallePresupuesto = presupuesto.detallePresupuesto;

      idPaquete = presupuesto.idPaquete;
      observaciones = presupuesto.observaciones;
      notasServicio = presupuesto.notasServicio;

      for (let element of detallePresupuesto) {
        total += Number(element.importeMonto * element.cantidad);
        let utilizarArticulo = false;
        if (element.servicioDetalleTraslado == 'paquete') {
          utilizarArticulo = true;
        }
        let coordOrigen = null;
        let coordDestino = null;
        let destino = null;
        let origen = null;
        let totalKilometros = null;
        if (element.servicioDetalleTraslado != null) {
          coordOrigen = [
            element.servicioDetalleTraslado.latitudInicial,
            element.servicioDetalleTraslado.longitudInicial,
          ];
          coordDestino = [
            element.servicioDetalleTraslado.latitudFinal,
            element.servicioDetalleTraslado.longitudFinal,
          ];
          destino = element.servicioDetalleTraslado.destino;
          origen = element.servicioDetalleTraslado.origen;
          totalKilometros = element.servicioDetalleTraslado.totalKilometros;
        }
        let datosPresupuesto = {
          idPaqueteDetallePresupuesto: element.idPaqueteDetallePresupuesto,
          cantidad: element.cantidad,
          concepto: element.concepto,
          kilometraje: totalKilometros,
          coordOrigen: coordOrigen,
          coordDestino: coordDestino,
          destino: destino,
          origen: origen,
          proveedor: element.nombreProveedor,
          grupo: element.grupo,
          idCategoria: element.idCategoria,
          idInventario: element.idInventario,
          totalKilometros: totalKilometros,
          idArticulo: element.idArticulo,
          idTipoServicio: element.idTipoServicio ?? null,
          idProveedor: element.idProveedor,
          totalPaquete: Number(element.importeMonto * element.cantidad),
          importe: element.importeMonto,
          esDonado: element.esDonado,
          proviene: element.proviene,
          utilizarArticulo: utilizarArticulo,
          activo: 1,
        };

        salidaPresupuesto.push(datosPresupuesto);
      }
    }

    let datosEtapaCaracteristicas = {
      observaciones: observaciones,
      notasServicio: notasServicio,
      paqueteSeleccionado: idPaquete,
      mostrarTIpoOtorgamiento: mostrarOtorgamiento,
      selecionaTipoOtorgamiento: otorgamiento,
      datosPaquetes: salidaPaquete,
      datosPresupuesto: salidaPresupuesto,
      elementosEliminadosPaquete: [],
      total: total,
    };
    this.gestionarEtapasService.datosEtapaCaracteristicas$.next(
      datosEtapaCaracteristicas
    );
  }

  datosInformacionServicio(datos: any): void {
    let validaPromotor = false;
    let idPromotor = datos.informacionServicioVelacion.idPromotor ?? null;
    if (idPromotor != null && Number(idPromotor) > 0) {
      validaPromotor = true;
    }

    let cp = datos.informacionServicioVelacion.cp;
    let codigoPostal = null;
    let calle = null;
    let interior = null;
    let exterior = null;
    let colonia = null;
    let municipio = null;
    let estado = null;
    let idDomicilio = null;

    if (cp != null) {
      codigoPostal = cp.codigoPostal;
      calle = cp.desCalle;
      interior = cp.numInterior;
      exterior = cp.numExterior;
      colonia = cp.desColonia;
      municipio = cp.desMunicipio;
      estado = cp.desEstado;
      idDomicilio = cp.idDomicilio;
    }

    let datosEtapaInformacionServicio = {
      fechaCortejo: datos.fechaCortejo ?? null,
      fechaCremacion: datos.fechaCremacion ?? null,
      fechaRecoger: datos.fechaRecoger ?? null,
      horaRecoger: datos.horaRecoger ?? null,
      horaCortejo: datos.horaCortejo ?? null,
      horaCremacion: datos.horaCremacion ?? null,
      idPanteon: datos.idPanteon ?? null,
      idPromotor: datos.idPromotor ?? null,
      idSala: datos.idSala ?? null,
      fechaInstalacion:
        datos.informacionServicioVelacion.fechaInstalacion ?? null,
      fechaVelacion: datos.informacionServicioVelacion.fechaVelacion ?? null,
      horaInstalacion:
        datos.informacionServicioVelacion.horaInstalacion ?? null,
      horaVelacion: datos.informacionServicioVelacion.horaVelacion ?? null,
      idCapilla: datos.informacionServicioVelacion.idCapilla ?? null,
      cp: codigoPostal,
      calle: calle,
      interior: interior,
      exterior: exterior,
      colonia: colonia,
      municipio: municipio,
      estado: estado,
      idDomicilio: idDomicilio,
      gestionadoPorPromotor: validaPromotor,
      promotor: datos.informacionServicioVelacion.idPromotor,
    };
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(
      datosEtapaInformacionServicio
    );
  }

  obtenerIdEtapaSeleccionada(idEtapaSeleccionada: number) {
    //Con esta etapa que se recibe ya se puede modificar su estado.
    //Al modificar el estado de la etapa su estilo se actualiza.
    // this.etapas.forEach((etapa: Etapa) => etapa.estado = EtapaEstado.Inactivo);
    // etapaSeleccionada.estado = EtapaEstado.Activo;
    this.idEtapaSeleccionada = idEtapaSeleccionada;
  }

  ngOnDestroy(): void {
    const datosEtapaFinado = {
      datosFinado: {
        tipoOrden: null,
        noContrato: null,
        velatorioPrevision: null,
        esObito: null,
        esParaExtremidad: null,
        matricula: null,
        matriculaCheck: true,
        curp: null,
        nss: null,
        nssCheck: true,
        nombre: null,
        primerApellido: null,
        segundoApellido: null,
        fechaNacimiento: null,
        edad: null,
        sexo: null,
        otroTipoSexo: null,
        nacionalidad: null,
        lugarNacimiento: null,
        paisNacimiento: null,
        fechaDefuncion: null,
        causaDeceso: null,
        lugarDeceso: null,
        horaDeceso: null,
        clinicaAdscripcion: null,
        unidadProcedencia: null,
        procedenciaFinado: null,
        tipoPension: null,
      },
      direccion: {
        calle: null,
        noExterior: null,
        noInterior: null,
        cp: null,
        colonia: null,
        municipio: null,
        estado: null,
        idDomicilio: null,
      },
    };
    const datosEtapaCaracteristicas = {
      observaciones: null,
      notasServicio: null,
      paqueteSeleccionado: null,
      mostrarTIpoOtorgamiento: false,
      selecionaTipoOtorgamiento: null,
      datosPaquetes: [],
      datosPresupuesto: [],
      elementosEliminadosPaquete: [],
      elementosEliminadosPresupuesto: [],
      total: 0,
    };
    const datosEtapaInformacionServicio = {
      fechaCortejo: null,
      fechaCremacion: null,
      fechaRecoger: null,
      horaRecoger: null,
      horaCortejo: null,
      horaCremacion: null,
      idPanteon: null,
      idPromotor: null,
      idSala: null,
      cp: null,
      fechaInstalacion: null,
      fechaVelacion: null,
      horaInstalacion: null,
      horaVelacion: null,
      idCapilla: null,
      calle: null,
      interior: null,
      exterior: null,
      colonia: null,
      municipio: null,
      estado: null,
      gestionadoPorPromotor: null,
      promotor: null,
    };
    const etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Activo,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Inactivo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Inactivo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
        },
      },
    ];

    this.gestionarEtapasService.datosContratante$.next({})
    this.gestionarEtapasService.datosEtapaFinado$.next(datosEtapaFinado);
    this.gestionarEtapasService.datosEtapaCaracteristicas$.next(datosEtapaCaracteristicas);
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(datosEtapaInformacionServicio);
    this.gestionarEtapasService.etapas$.next(etapas)
  }
}
