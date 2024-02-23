export interface SolicitudActualizarConvenioPA {
  plan: PlanPA,
  titularSustituto: SustitutoBeneficiario | null
  beneficiario1: Beneficiario | null
  beneficiario2: Beneficiario | null
}

export interface PlanPA {
  idPagonMensual: number,
  idPaquete: number,
  idTitularSust: number | null,
  indTitularSut: boolean,
  idConvenio: number,
  curp: string,
  rfc: string,
  nss: string,
  nombre: string,
  primApellido: string,
  segApellido: string,
  numSex: string,
  oreoSex: string,
  fecNac: string,
  idPais: number,
  idEstado: number | null,
  telefono: string,
  telefonoFij: string,
  correo: string,
  idPersonaContratante: number,
  idDomicilio: number,
  calle: string,
  numExt: string,
  numInt: string,
  cp: string,
  colonia: string,
  municipio: string,
  estado: string
}

export interface SustitutoBeneficiario {
  idDomicilio: number,
  idPersonaTitular: number,
  calle: string,
  numExt: string,
  numInt: string,
  colonia: string,
  municipio: string,
  estado: string,
  nss: string,
  curp: string,
  rfc: string,
  nombre: string,
  primerApe: string,
  segunApe: string,
  sexo: number,
  fechaNac: string,
  idPais: number,
  telefonoFijo: string,
  telefono: string,
  correo: string,
  idEstado: number,
  otroSexo: string
}

export interface Beneficiario {
  idBeneficiario: number | null;
  curp: string;
  rfc: string;
  matricula: string;
  nss: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  idSexo: number;
  sexo: string;
  otroSexo: string;
  fecNacimiento: string;
  idPais: number;
  pais: string;
  idLugarNac: number | null;
  lugarNac: string;
  telFijo: string;
  telCelular: string;
  correo: string;
  calle: string;
  numExt: string;
  numInt: string;
  cp: string;
  colonia: string;
  municipio: string;
  idEstado: number;
  estado: string;
  idPersonaTitular: number;
  idDomicilio: number;
}
