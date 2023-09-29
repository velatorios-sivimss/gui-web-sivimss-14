import {ModeloGuardarPorPersona} from "./modelo-guardar-por-persona.interface";

export interface ModeloGuardarPorEmpresa {
  idVelatorio?:string,
  nombreVelatorio?:string,
  indTipoContratacion?:number,
  idPromotor?:string,
  numeroConvenio?: string,
  folioConvenio?: string,
  rfcCurp?: string,
  empresa?:{
    nombreEmpresa?:string,
    razonSocial?:string,
    rfc?:string,
    pais?:string,
    cp?:string,
    colonia?:string,
    estado?:string,
    municipio?:string,
    calle?:string,
    numeroExterior?:string,
    numeroInterior?:string,
    telefono?:string,
    correoElectronico?:string,
    personas?:[ModeloGuardarPorPersona]
  }
}
