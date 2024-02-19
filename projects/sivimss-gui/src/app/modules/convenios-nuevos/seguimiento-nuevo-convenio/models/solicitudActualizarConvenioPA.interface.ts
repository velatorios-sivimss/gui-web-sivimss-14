export interface SolicitudActualizarConvenioPA {
  plan: PlanPA,
  titularSustituto: SustitutoBeneficiario | null
  beneficiario1: SustitutoBeneficiario | null
  beneficiario2: SustitutoBeneficiario | null
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
  fecNac: string,
  idPais: number,
  telefonoFijo: string,
  telefono: string,
  correo: string,
  idEstado: number,
  otroSexo: string
}
