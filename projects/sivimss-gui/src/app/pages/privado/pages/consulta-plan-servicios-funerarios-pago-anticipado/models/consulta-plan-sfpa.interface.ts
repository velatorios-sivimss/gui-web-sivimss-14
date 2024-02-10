export interface ListadoPlanes {
  nombreSubtitular?: string;
  curpSubtitular?: string;
  curpTitular?: string;
  nombreTitular?: string;
  idPlanSfpa?: number;
  numFolioPlanSfpa?: string;
}

export interface DetalleServicioFunerario {
  idPlanSfpa?: number;
  numFolioPlanSFPA?: string;
  idTipoContratacion?: number;
  idPaquete?: number;
  desPaquete?: string;
  nomPaquete?: string;
  idTipoPagoMensual?: number;
  desTipoPagoMensual?: number;
  indTitularSubstituto?: number;
  indModificarTitularSubstituto?: number;
  indPromotor?: number | null,
  idPromotor?: number | null,
  idVelatorio?: number;
  desIdVelatorio?: string;
  idEstatusPlanSfpa?: number;
  desEstatusPlanSfpa?: string;
  indActivo?: number;
  indTipoPagoMensual?: false,
  fecIngreso?: string;
  numPago?: number;
  titularesBeneficiarios: TitularesBeneficiarios[];
  pagoSFPA: PagoSFPA[];
}

export interface TitularesBeneficiarios {
  idPersona?: number;
  persona?: string;
  curp?: string;
  rfc?: string;
  nss?: string;
  nomPersona?: string;
  primerApellido?: string;
  segundoApellido?: string;
  sexo?: number;
  otroSexo?: string;
  fecNacimiento?: string;
  nacionalidad?: number | null,
  lugarNac?: string;
  idPais?: number;
  pais?: string;
  idEstado?: number;
  telefono?: string;
  telefonoFijo?: string;
  correo?: string;
  tipoPersona?: string;
  ine?: string;
  idUsuario?: number | null,
  idContratante?: number | null,
  idTitularBeneficiarios?: number | null,
  idBeneficiario1?: number | null,
  idBeneficiario2?: number | null,
  matricula?: string;
  cp?: CP;
}

export interface CP {
  idDomicilio?: number;
  desCalle?: string;
  numExterior?: string;
  numInterior?: string;
  codigoPostal?: number;
  desColonia?: string;
  desMunicipio?: string;
  desEstado?: string;
  idUsuario?: number | null;
}

export interface PagoSFPA {
  idPagoSFPA?: number;
  fechaParcialidad?: string;
  importeMensual?: number;
  importeAcumulado?: number;
  estatusPago?: string;
  noPagos?: string;
  velatorio?: string;
  validaPago?: number;
  idPlanSFPA?: number;
  idEstatus?: number;
  importePagado?: number;
  folioRecibo?: string;
  metodoPago?: any;
}