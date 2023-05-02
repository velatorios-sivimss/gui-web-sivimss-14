import {BeneficiarioInterface} from "./beneficiario.interface";

export interface PersonaInterface {
  curp?: string;
  rfc?: string;
  matricula?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  sexo?: number;
  nacionalidad?: number;
  lugarNacimiento?: string;
  correoElectronico?: string;
  telefono?: number;
  calle?: string;
  noExterior?: string;
  noInterior?: string;
  cp?: number;
  colonia?: string;
  municipio?: string;
  estado?: number;
  tipoPaquete?: number;
  enfermedadPrexistente?: number;
  descEnfermedadPrexistente?: string;
  beneficiario?: BeneficiarioInterface[];
}
