export interface ContratarPlanSFPA {
  idVelatorio?: number | null,
  idTipoContratacion?: number | null,
  idPaquete?: number | null,
  idTipoPagoMensual?: number | null,
  numPagoMensual?: number | null,
  indTitularSubstituto?: number | null,// si = 1, No = 0
  indPromotor?: number | null,// si = 1, No = 0
  idPromotor?: number | null,
  monPrecio?: number | null,
  indTipoPagoMensual?: boolean | null,
  titularesBeneficiarios: Persona[],
}

export interface Persona {
  persona?: string | null,
  rfc?: string | null,
  curp?: string | null,
  matricula?: string | null,
  nss?: string | null,
  nomPersona?: string | null,
  primerApellido?: string | null,
  segundoApellido?: string | null,
  sexo?: number | null,
  otroSexo?: string | null,
  fecNacimiento?: string | null,
  idPais?: number | null,
  idEstado?: number | null,
  telefono?: string | null,
  telefonoFijo?: string | null,
  correo?: string | null,
  tipoPersona?: string | null,
  ine?: string | null,
  cp?: CodigoPostal | null
}

export interface CodigoPostal {
  desCalle: string | null
  numExterior: string | null
  numInterior: string | null
  codigoPostal: number | null
  desColonia: string | null
  desMunicipio: string | null
  desEstado: string | null
}

export interface Paquete {
  idPaquete: number,
  nomPaquete: string;
  descPaquete: string;
  monPrecio: number;
  serviciosPaquetes?: string[],
}

export interface ServiciosPaquetes {

}