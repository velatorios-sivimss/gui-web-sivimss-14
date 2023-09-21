import {PersonaInterface} from "./persona.interface";

export interface Empresa {
  nombre?: string,
  razonSocial?: string,
  rfc?: string,
  pais?: number,
  cp?: number,
  colonia?: string,
  estado?: string,
  municipio?: string,
  calle?: string,
  numeroExterior?: string,
  numeroInterior?: string,
  telefono?: string,
  correoElectronico?: string,
  personas?: PersonaInterface[],
}
