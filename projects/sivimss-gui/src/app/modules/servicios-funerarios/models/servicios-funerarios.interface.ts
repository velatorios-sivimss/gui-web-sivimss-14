export interface ServiciosFunerariosInterface {
  folioPlanSFPA?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  estado?: string;
  correoElectronico?: string;
  paquete?: string;
  tipoPaquete?: number;
  numeroPago?: number;
  estatusPlan?: string;
  estatusPago?: string;
  fechaContrato?: string;
  curp?: string;
  rfc?: string;
  matricula?: number;
  nss?: number;
  sexo?: number;
  fechaNacimiento?: number | null;
  nacionalidad?: number;
  lugarNacimiento?: string;
  telefono?: number;
  cp?: number;
  calle?: string;
  numeroInterior?: string;
  numeroExterior?: string;
  colonia?: string;
  municipio?: string;
  datosIguales?: boolean;
}

export interface DetallePago {
  velatorio?: string;
  pagos?: string;
  fechaPago?: string;
  metodoPago?: string;
  noReciboPago?: number;
  estatus?: string;
  monto?: number;
}

export interface ConsultaPaginado {
  idPlanSfpa: number | null,
  estatusPago: string | null,
  estatusPlan: string | null,
  estado: string | null,
  correo: string | null,
  numFolio: string | null,
  nombreCompleto: string | null,
  noPago: string | null,
  paquete: string | null
}

export interface GenerarReporte {
  idVelatorio: string | null,
  numFolioPlanSfpa: string | null,
  rfc: string | null,
  curp: string | null,
  nombreAfiliado: string | null,
  idEstatusPlanSfpa: string | null,
  fechaInicio: string | null,
  fechaFin: string | null,
  tipoReporte: string | null,
}

export interface AgregarPlanSFPA {
  idPlanSfpa?: number | null,
  indTipoPagoMensual?: boolean | null,
  idTipoContratacion: number | null,
  idPaquete: number | null,
  monPrecio: number | null,
  indPromotor?: number | null,
  idPromotor?: number | null,
  numFolioPlanSFPA?: string | null,
  idTipoPagoMensual: number | null,
  indTitularSubstituto: number | null,
  numPagoMensual: number | null,
  indModificarTitularSubstituto: number | null,
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

export interface NSS {
  curp?: string,
  cveIdPersona?: number,
  datosPersonaRenapo?: string,
  estadoCivil?: string,
  fechaDefuncion?: string,
  fechaNacimiento?: string,
  lugarNacimiento?: LugarNacimiento,
  nombre?: string,
  nss?: string,
  pais?: number | null,
  primerApellido?: string,
  rfc?: number | null,
  segundoApellido?: string,
  sexo?: Sexo,
}

export interface LugarNacimiento {
  clave?: string;
  claveRenapo?: string;
  idRenapo?: string;
  nombre?: string;
}

export interface Sexo {
  descripcion?: string;
  genero?: number;
  idSexo?: number;
}

export interface SolicitudCreacionSFPA {
  plan: SolicitudPlan,
  contratante: SolicitudContratante,
  titularSubstituto: SolicitudSubstituto | null,
  beneficiario1: SolicitudBeneficiario | null,
  beneficiario2: SolicitudBeneficiario | null
}

export interface SolicitudPlan {
  idPlanSfpa: null,
  idTipoContratacion: number,
  idPaquete: number,
  monPrecio: string,
  idTipoPagoMensual: number,
  pagoMensual: string,
  indTitularSubstituto: number,
  indModificarTitularSubstituto: number,
  indPromotor: number,
  idPromotor: number | null,
  idVelatorio: number | null,
  idEstatusPlan: number
}

export interface SolicitudContratante {
  persona: 'titular',
  idContratante: null,
  idPersona: null,
  rfc: string,
  curp: string,
  matricula: string,
  nss: string,
  nomPersona: string,
  primerApellido: string,
  segundoApellido: string,
  idSexo: number,
  otroSexo: string,
  fecNacimiento: string,
  idPais: number,
  idEstado: number,
  telefono: string,
  telefonoFijo: string,
  correo: string,
  ine: null,
  idDomicilio: null,
  desCalle: string,
  numExterior: string,
  numInterior: string,
  codigoPostal: string,
  desColonia: string,
  desMunicipio: string,
  desEstado: string
}

export interface SolicitudSubstituto {
  persona: "titular substituto",
  idPersona: null,
  rfc: string,
  curp: string,
  matricula: string,
  nss: string,
  nomPersona: string,
  primerApellido: string,
  segundoApellido: string,
  idSexo: number,
  otroSexo: string,
  fecNacimiento: string,
  idPais: number,
  idEstado: number,
  telefono: string,
  telefonoFijo: string | null,
  correo: string,
  ine: null,
  idDomicilio: null,
  desCalle: string,
  numExterior: string,
  numInterior: string,
  codigoPostal: string,
  desColonia: string,
  desMunicipio: string,
  desEstado: string
}

export interface SolicitudBeneficiario {
  persona: 'beneficiario 2' | 'beneficiario 1',
  idPersona: null,
  rfc: string,
  curp: string,
  matricula: string,
  nss: string,
  nomPersona: string,
  primerApellido: string,
  segundoApellido: string,
  idSexo: number,
  otroSexo: string,
  fecNacimiento: string,
  idPais: number,
  idEstado: number,
  telefono: string,
  telefonoFijo: string,
  correo: string,
  ine: null,
  idDomicilio: null,
  desCalle: string,
  numExterior: string,
  numInterior: string,
  codigoPostal: string,
  desColonia: string,
  desMunicipio: string,
  desEstado: string
}
