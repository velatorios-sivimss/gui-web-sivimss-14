import {Component, OnDestroy} from '@angular/core';
import {EtapaEstado} from "projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum";
import {Etapa} from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";
import {Subscription} from "rxjs";
import {GestionarEtapasServiceSF} from "../../../services/gestionar-etapas.service-sf";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-generar-orden-servicio-sf',
  templateUrl: './generar-orden-servicio.component.html',
  styleUrls: ['./generar-orden-servicio.component.scss'],
  providers: [CookieService]
})
export class GenerarOrdenServicioSFComponent implements OnDestroy {

  readonly DATOS_DEL_CONTRATANTE: number = 0;
  readonly DATOS_DEL_FINADO: number = 1;
  readonly CARACTERISTICAS_DEL_PRESUPUESTO: number = 2;
  readonly INFORMACION_DEL_SERVICIO: number = 3;
  readonly DETALLE_ORDEN_SERVICIO: number = 4
  detalle_orden_servicio: boolean = true;

  contratanteSubscription$!: Subscription;

  idEtapaSeleccionada: number = 0;

  constructor(
    private gestionarEtapasService: GestionarEtapasServiceSF,
    private cookieService: CookieService
  ) {
  }


  obtenerIdEtapaSeleccionada(datos: any) {
    //Con esta etapa que se recibe ya se puede modificar su estado.
    //Al modificar el estado de la etapa su estilo se actualiza.
    // this.etapas.forEach((etapa: Etapa) => etapa.estado = EtapaEstado.Inactivo);
    // etapaSeleccionada.estado = EtapaEstado.Activo;
    this.detalle_orden_servicio = datos.detalle_orden_servicio;
    this.idEtapaSeleccionada = datos.idEtapaSeleccionada;
  }

  ngOnDestroy(): void {
    this.cookieService.delete('drop_down');
    const datosEtapaContratante = {
      datosContratante: {
        idPersona: null,
        idContratante: null,
        matricula: null,
        matriculaCheck: true,
        rfc: null,
        curp: null,
        nombre: null,
        primerApellido: null,
        segundoApellido: null,
        fechaNacimiento: null,
        sexo: null,
        otroTipoSexo: null,
        nacionalidad: null,
        lugarNacimiento: null,
        paisNacimiento: null,
        telefono: null,
        correoElectronico: null,
        parentesco: null,
      },
      direccion: {
        calle: null,
        noExterior: null,
        noInterior: null,
        cp: null,
        colonia: null,
        municipio: null,
        estado: null,
      },
    };
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

    this.gestionarEtapasService.datosEtapaContratante$.next(datosEtapaContratante);
    this.gestionarEtapasService.datosEtapaFinado$.next(datosEtapaFinado);
    this.gestionarEtapasService.datosEtapaCaracteristicas$.next(datosEtapaCaracteristicas);
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(datosEtapaInformacionServicio);
    this.gestionarEtapasService.etapas$.next(etapas)


  }

}
