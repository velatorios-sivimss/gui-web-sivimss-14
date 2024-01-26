export interface ContratoSfpaInterface {
  idConvenioPa: number | null,
  folio: string | null,
  idVelatorio: number | null,
  nombreVelatorio: string | null,
  contratante?: Contratante[]
}

export interface Contratante {
  idPersona: number | null,
  rfc: string | null,
  curp: string | null,
  nss: string | null,
  nomPersona: string | null,
  primerApellido: string | null,
  segundoApellido: string | null,
  sexo: number,
  otroSexo: string | null,
  fechaNac: string,
  nacionalidad: string,
  idPais: number,
  idEstado: number,
  telefono: string | null,
  correo: string | null,
  idContratante: number | null,
  matricula: string | null,
  tipo: string | null,
  cp: CP
}

export interface CP {
  idDomicilio: number
  desCalle: string
  numExterior: string
  numInterior: string
  codigoPostal: string
  desColonia: string
  desMunicipio: string
  desEstado: string
  desCiudad: string
}
