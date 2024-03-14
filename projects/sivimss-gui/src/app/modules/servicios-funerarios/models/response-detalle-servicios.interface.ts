export interface ResponseDetalleServicios {
  beneficiario1: ResponseBeneficiarioServicios | null,
  beneficiario2: ResponseBeneficiarioServicios | null,
  contratante: ResponseContratanteServicios,
  plan: ResponsePlanServicios,
  titularSubstituto: null
}

export interface ResponsePlanServicios {
  costoPaquete: number,
  idPaquete: number,
  idPromotor: number,
  indPromotor: boolean,
  indTitularSubstituto: boolean,
  nombrePaquete: string,
  nombrePromotor: string,
  pago: number,
  velatorio: string,
  noPagos: string
}

export interface ResponseContratanteServicios {
  codigoPostal: string,
  correo: string,
  curp: string,
  desCalle: string,
  desColonia: string,
  desEstado: string,
  desMunicipio: string,
  estado: string,
  fechaNac: string,
  idContratante: number,
  idDomicilio: number,
  idEstado: number,
  idNacionalidad: number,
  idPais: number,
  idPersona: number,
  idPlanSfpa: number,
  idSexo: number,
  matricula: string,
  nacionalidad: string,
  nomPersona: string,
  nombreCompleto: string,
  nss: string,
  numExterior: string,
  numFolio: string,
  numInterior: string,
  otroSexo: string,
  pais: string,
  primerApellido: string,
  rfc: string,
  segundoApellido: string,
  sexo: string,
  telefonoFijo: string,
  telefono: string
}

export interface ResponseBeneficiarioServicios {
  codigoPostal: string,
  correo: string,
  curp: string,
  desCalle: string,
  desColonia: string,
  desEstado: string,
  desMunicipio: string,
  fechaNac: string,
  idDomicilio: string,
  idEstado: number,
  idNacionalidad: number,
  idPais: number,
  idPersona: number,
  idPlanSfpa: number,
  idSexo: number,
  idTitularBeneficiario: number,
  matricula: string,
  nacionalidad: string,
  nomPersona: string,
  nombreCompleto: string,
  nss: string,
  numExterior: string,
  numInterior: string,
  otroSexo: string,
  primerApellido: string,
  rfc: string,
  segundoApellido: string,
  sexo: string,
  telefono: string,
  estado: string,
  pais: string
}
