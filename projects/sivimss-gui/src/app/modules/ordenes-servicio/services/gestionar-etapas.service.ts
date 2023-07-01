import { Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { EtapaEstado } from "../../../shared/etapas/models/etapa-estado.enum";
import { Etapa } from "../../../shared/etapas/models/etapa.interface";
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from "../../../utils/constantes";
import { AltaODSInterface } from "../models/AltaODS.interface";
import { ContratanteInterface } from "../models/Contratante.interface";
import { CodigoPostalIterface } from "../models/CodigoPostal.interface";

@Injectable()
export class GestionarEtapasService {


  altaODS:AltaODSInterface=  {} as AltaODSInterface;
  contratante:ContratanteInterface={} as ContratanteInterface;
  cp:CodigoPostalIterface={} as CodigoPostalIterface;

  etapas: Etapa[] = [
    {
      idEtapa: 0,
      estado: EtapaEstado.Activo,
      textoInterior: '1',
      textoExterior: 'Datos del contratante',
      lineaIzquierda: {
        mostrar: false,
        estilo: "solid"
      },
      lineaDerecha: {
        mostrar: true,
        estilo: "solid"
      }
    },
    {
      idEtapa: 1,
      estado: EtapaEstado.Inactivo,
      textoInterior: '2',
      textoExterior: 'Datos del finado',
      lineaIzquierda: {
        mostrar: true,
        estilo: "solid"
      },
      lineaDerecha: {
        mostrar: true,
        estilo: "solid"
      }
    },
    {
      idEtapa: 2,
      estado: EtapaEstado.Inactivo,
      textoInterior: '3',
      textoExterior: 'Características del presupuesto',
      lineaIzquierda: {
        mostrar: true,
        estilo: "solid"
      },
      lineaDerecha: {
        mostrar: true,
        estilo: "solid"
      }
    },
    {
      idEtapa: 3,
      estado: EtapaEstado.Inactivo,
      textoInterior: '4',
      textoExterior: 'Información del servicio',
      lineaIzquierda: {
        mostrar: true,
        estilo: "solid"
      },
      lineaDerecha: {
        mostrar: false,
        estilo: "solid"
      }
    }
  ];

  datosEtapaContratante = {
    datosContratante: {
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
      parentesco: null
    },
    direccion: {
      calle: null,
      noExterior: null,
      noInterior: null,
      cp: null,
      colonia: null,
      municipio: null,
      estado: null
    }
  };


  datosEtapaFinado= {
    datosFinado:{
      tipoOrden: null,
      noContrato: null,
      velatorioPrevision: null,
      esObito: null,
      esParaExtremidad: null,
      matricula: null,
      matriculaCheck: null,
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
      direccion: {
        calle: null,
        noExterior: null,
        noInterior: null,
        cp:null,
        colonia: null,
        municipio: null,
        estado: null
      }
    }
  };
  
  etapas$: BehaviorSubject<Etapa[]> = new BehaviorSubject<Etapa[]>(this.etapas);
  idEtapaSeleccionada$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  datosEtapaContratante$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaContratante);
  datosEtapaFinado$: BehaviorSubject<any> = new BehaviorSubject<any>(this.datosEtapaFinado);
  altaODS$: BehaviorSubject<any> = new BehaviorSubject<any>(this.altaODS);

  constructor(
    // _http:HttpClient, 
    // private authService: AutenticacionService
  ) { this.altaODS.contratante=this.contratante;
    this.altaODS.contratante.cp=this.cp;  }

}

