import {PersonaInterface} from "./persona.interface";

export interface ModeloGuardarPorPersona {
  folioConvenio?: string,
  idVelatorio?: string,
  nombreVelatorio?: string,
  indTipoContratacion?: string,
  idPromotor?: string,
  matricula?: string,
  rfc?: string,
  curp?: string,
  nss?: string,
  numIne?: string,
  nombre?: string,
  primerApellido?: string,
  segundoApellido?: string,
  sexo?: string,
  otroSexo?: string,
  fechaNacimiento?: string,
  tipoPersona?: string,
  calle?: string,
  numeroExterior?: string,
  numeroInterior?: string,
  cp?: string,
  colonia?: string,
  municipio?: string,
  estado?: string,
  pais?: string,
  correoElectronico?: string,
  telefono?: string,
  enfermedadPreexistente?: string,
  otraEnfermedad?: string,
  paquete?: string,
  persona: PersonaInterface,
  idPersona?: unknown,
  idDomicilio?: string | null,
  idContratante?: string | null,
  numeroConvenio?: string,
  rfcCurp?: string,
  documentacion?: {
    validaIneContratante: boolean | undefined,
    validaCurp: boolean | undefined,
    validaRfc: boolean | undefined,
  }
}
