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
  noExterior?: string;
  noInterior?: string;
  pais?: number;
  cp?: number;
  colonia?: string;
  municipio?: string;
  estado?: string;
  tipoPaquete?: number;
  enfermedadPrexistente?: number;
  ineAfiliado?: boolean,
  copiaCURP?: boolean,
  copiaRFC?: boolean,
  beneficiario?: BeneficiarioInterface[];
}
