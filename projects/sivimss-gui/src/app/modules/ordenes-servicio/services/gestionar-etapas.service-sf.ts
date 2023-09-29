import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { EtapaEstado } from '../../../shared/etapas/models/etapa-estado.enum';
import { Etapa } from '../../../shared/etapas/models/etapa.interface';

import {AltaODSSFInterface} from "../models/AltaODSSF.interface";
import { ContratanteInterface } from '../models/Contratante.interface';
import { CodigoPostalIterface } from '../models/CodigoPostal.interface';
import { FinadoSFInterface} from '../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../models/CaracteristicasPaquete.interface';
import { CaracteristicasDelPresupuestoInterface } from '../models/CaracteristicasDelPresupuesto.interface';
import { DetallePaqueteInterface } from '../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../models/ServicioDetalleTraslado.interface';
import { DetallePresupuestoInterface } from '../models/DetallePresupuesto.interface';
import { InformacionServicioVelacionInterface } from '../models/InformacionServicioVelacion.interface';
import { InformacionServicioInterface } from '../models/InformacionServicio.interface';

@Injectable()
export class GestionarEtapasServiceSF {
  altaODS: AltaODSSFInterface = {} as AltaODSSFInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoSFInterface = {} as FinadoSFInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface = {} as CaracteristicasPresupuestoInterface;
  caracteristicasPaquete: CaracteristicasPaqueteInterface = {} as CaracteristicasPaqueteInterface;
  detallePaquete: Array<DetallePaqueteInterface> = [] as Array<DetallePaqueteInterface>;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface = {} as ServicioDetalleTrasladotoInterface;
  paquete: DetallePaqueteInterface = {} as DetallePaqueteInterface;
  cpFinado: CodigoPostalIterface = {} as CodigoPostalIterface;
  caracteristicasDelPresupuesto: CaracteristicasDelPresupuestoInterface = {} as CaracteristicasDelPresupuestoInterface;
  detallePresupuesto: Array<DetallePresupuestoInterface> = [] as Array<DetallePresupuestoInterface>;
  presupuesto: DetallePresupuestoInterface = {} as DetallePresupuestoInterface;
  servicioDetalleTrasladoPresupuesto: ServicioDetalleTrasladotoInterface = {} as ServicioDetalleTrasladotoInterface;
  informacionServicio: InformacionServicioInterface = {} as InformacionServicioInterface;
  informacionServicioVelacion: InformacionServicioVelacionInterface = {} as InformacionServicioVelacionInterface;
  cpVelacion: CodigoPostalIterface = {} as CodigoPostalIterface;

  etapas: Etapa[] = [
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

  datosEtapaContratante = {
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

  datosEtapaFinado = {
    datosFinado: {
      folioValido: null,
      tipoOrden: null,
      noContrato: null,
      velatorioPrevision: null,
      matricula: null,
      curp: null,
      nss: null,
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

  datosEtapaCaracteristicas = {
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

  datosEtapaInformacionServicio = {
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
  detalleODS = [];
  etapas$: BehaviorSubject<Etapa[]> = new BehaviorSubject<Etapa[]>(this.etapas);
  idEtapaSeleccionada$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  datosEtapaContratante$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaContratante);

  datosEtapaCaracteristicas$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaCaracteristicas);

  datosEtapaFinado$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaFinado);

  datosEtapaInformacionServicio$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaInformacionServicio);

  altaODS$: BehaviorSubject<any> = new BehaviorSubject<any>(this.altaODS);

  detalleODS$: BehaviorSubject<any> = new BehaviorSubject<any>(this.detalleODS);

  constructor() {
    // private authService: AutenticacionService // _http:HttpClient,
    this.altaODS.contratante = this.contratante;
    this.contratante.cp = this.cp;

    this.altaODS.finado = this.finado;
    this.finado.cp = this.cpFinado;


    this.altaODS.caracteristicasPresupuesto = this.caracteristicasPresupuesto;
    this.caracteristicasPresupuesto.caracteristicasPaquete = this.caracteristicasPaquete;
    this.caracteristicasPaquete.detallePaquete = this.detallePaquete;
    this.paquete.servicioDetalleTraslado = this.servicioDetalleTraslado;
    this.caracteristicasPresupuesto.caracteristicasDelPresupuesto = this.caracteristicasDelPresupuesto;
    this.caracteristicasDelPresupuesto.detallePresupuesto = this.detallePresupuesto;
    this.presupuesto.servicioDetalleTraslado = this.servicioDetalleTrasladoPresupuesto;

    this.altaODS.informacionServicio = this.informacionServicio;
    this.informacionServicio.informacionServicioVelacion = this.informacionServicioVelacion;
    this.informacionServicioVelacion.cp = this.cpVelacion;
  }
}
