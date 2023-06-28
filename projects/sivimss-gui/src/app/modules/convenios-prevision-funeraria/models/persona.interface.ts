import {BeneficiarioInterface} from "./beneficiario.interface";

export interface PersonaInterface {
  curp?: string;
  rfc?: string;
  matricula?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  correoElectronico?: string;
  telefono?: number;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  pais?: number;
  cp?: number;
  colonia?: string;
  municipio?: string;
  estado?: string;
  paquete?: number;
  enfermedadPreexistente?: number;
  ineAfiliado?: boolean,
  copiaCURP?: boolean,
  copiaRFC?: boolean,
  beneficiarios?: BeneficiarioInterface[];
  documentacion:{
    validaIneContratante?:boolean,
    validaCurp?:boolean,
    validaRfc?:boolean,
  },



  nss?: string,
  numIne?: string,
  sexo?: number | string,
  otroSexo?: string,
  fechaNacimiento?: string,
  tipoPersona?: number | string,
  otraEnfermedad?: string,



}
