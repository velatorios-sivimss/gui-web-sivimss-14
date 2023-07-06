export interface BeneficiarioInterface {
  velatorio?: number;
  descVelatorio?: string;
  fechaNacimiento?: any;
  edad?: number;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  parentesco?: number;
  descParentesco?: string;
  curp?: string;
  rfc?: string;
  actaNacimiento?: string;
  correoElectronico?: string;
  telefono?: number;

  documentacion?: any,

  matricula?: string,
  nss?: string,
  numIne?: string,
  sexo?: string,
  otroSexo?: string,
  tipoPersona?: string,
  calle?: string,
  numeroExterior?: string,
  numeroInterior?: string,
  cp?: string,
  colonia?: string,
  municipio?: string,
  estado?: string,
  pais?: string,
  enfermedadPreexistente?: string,
  otraEnfermedad?: string,
}
