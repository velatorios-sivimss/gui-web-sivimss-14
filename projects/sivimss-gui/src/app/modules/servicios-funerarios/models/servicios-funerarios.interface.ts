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
  "plan": {
    "idPlanSfpa": null,
    "idTipoContratacion": 1,
    "idPaquete": 15,
    "monPrecio": "10999",
    "idTipoPagoMensual": 2,
    "pagoMensual": 6,
    "indTitularSubstituto": 0,
    "indModificarTitularSubstituto": 0,
    "indPromotor": 1,
    "idPromotor": 3,
    "idVelatorio": 1,
    "idEstatusPlan": 1
  },
  "contratante": {
    "persona": "titular",
    "idContratante": null,
    "idPersona": null,
    "rfc": "RAGD980306C9A",
    "curp": "RAGD980306MDFVRN00",
    "matricula": "",
    "nss": "65633512283",
    "nomPersona": "DIANA LIZETH",
    "primerApellido": "RAVIELA",
    "segundoApellido": "GUERRERO",
    "idSexo": 1,
    "otroSexo": "",
    "fecNacimiento": "1998-03-06",
    "idPais": 119,
    "idEstado": 7,
    "telefono": "4844655596",
    "telefonoFijo": "4878894849",
    "correo": "eduardo.gomez@people-media.com.mx",
    "tipoPersona": "",
    "ine": null,
    "idDomicilio": null,
    "desCalle": "Gral Prueba",
    "numExterior": "12",
    "numInterior": "",
    "codigoPostal": "55994",
    "desColonia": "Santa Ana Tlachiahualpa",
    "desMunicipio": "TEMASCALAPA",
    "desEstado": "MÉXICO"
  },
  "titularSubstituto": {
    "persona": "titular substituto",
    "idPersona": null,
    "rfc": "RAGD980306C9A",
    "curp": "RAGD980306MDFVRN00",
    "matricula": "",
    "nss": "65633512283",
    "nomPersona": "DIANA LIZETH",
    "primerApellido": "RAVIELA",
    "segundoApellido": "GUERRERO",
    "idSexo": 1,
    "otroSexo": "",
    "fecNacimiento": "1998-03-06",
    "idPais": 119,
    "idEstado": 7,
    "telefono": "4844655596",
    "telefonoFijo": "4878894849",
    "correo": "eduardo.gomez@people-media.com.mx",
    "tipoPersona": "",
    "ine": null,
    "idDomicilio": null,
    "desCalle": "Gral Prueba2",
    "numExterior": "122",
    "numInterior": "",
    "codigoPostal": "55991",
    "desColonia": "Santa Ana Tlachiahualpa",
    "desMunicipio": "TEMASCALAPA",
    "desEstado": "MÉXICO"
  },
  beneficiario1: Beneficiario | null,
  beneficiario2: Beneficiario | null
}

export interface Beneficiario {
  persona: string,
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
  tipoPersona: string,
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
