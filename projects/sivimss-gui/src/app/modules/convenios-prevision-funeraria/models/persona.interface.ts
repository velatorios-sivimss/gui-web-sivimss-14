import {BeneficiarioInterface} from "./beneficiario.interface";

export interface PersonaInterface {
  curp?: string;
  rfc?: string;
  matricula?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  correoElectronico?: string;
  telefono?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  pais?: string;
  cp?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  paquete?: string;
  enfermedadPreexistente?: string;
  ineAfiliado?: boolean,
  copiaCURP?: boolean,
  copiaRFC?: boolean,
  beneficiarios?: BeneficiarioInterface[];
  documentacion:{
    validaIneContratante?:boolean,
    validaCurp?:boolean,
    validaRfc?:boolean,
    validaActaNacimientoBeneficiario?: boolean,
    validaIneBeneficiario?: boolean,
  },



  nss?: string,
  numIne?: string,
  sexo?: number | string,
  otroSexo?: string,
  fechaNacimiento?: string,
  tipoPersona?: number | string,
  otraEnfermedad?: string,



}
