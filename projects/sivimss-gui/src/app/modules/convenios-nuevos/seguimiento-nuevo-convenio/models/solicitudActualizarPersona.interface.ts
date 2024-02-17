export interface SolicitudActualizarPersona {
  convenio: SolicitudActualizarSolicitante,
  beneficiarios: SolicitudActualizarBeneficiario[];
}

export interface SolicitudActualizarSolicitante {
  idConvenioPF: number,
  idPersona: number,
  idPais: number,
  idEstado: number,
  idDomicilio: number,
  idPaquete: number,
  idContraPaqPF: number,
  nombre: string,
  primerApe: string,
  segunApe: string,
  curp: string,
  rfc: string,
  correo: string,
  telefono: string,
  calle: string,
  numExt: string,
  numInt: string,
  cp: string,
  colonia: string,
  municipio: string,
  estado: string,
  indEnfermedad: number,
  otraEnfermedad: string
}

export interface SolicitudActualizarBeneficiario {
  idPersona: number,
  idBeneficiario: number,
  idParentesco: number,
  nombre: string,
  curp: string,
  rfc: string,
  correo: string,
  telefono: string
}
