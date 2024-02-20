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
  indEnfermedad: boolean,
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

export interface SolicitudBeneficiario {
  validaIne: boolean,
  nombreIne: string | null,
  validaActa: boolean,
  nombreActa: string | null,
  documento: string | null,
  idContratanteBeneficiario: number,
  rfc: string,
  curp: string,
  nombre: string,
  primerApe: string,
  segunApe: string,
  idSexo: number,
  otroSexo: string,
  fechaNaciemiento: string,
  idPais: number,
  idEstado: number,
  telefono: string,
  correo: string,
  idPersona: number
}

export interface SolicitudEmpresa {
  nombre:string,
  razonSocial:string,
  rfc: string,
  idPais:number,
  telefono:string,
  correo: string,
  idEmpresa:number,
  idConvenioPF:number,
  calle: string,
  numExt:string,
  numInt:string,
  cp:string,
  colonia:string,
  municipio:string,
  estado:string,
  idDomicilio:number
}
