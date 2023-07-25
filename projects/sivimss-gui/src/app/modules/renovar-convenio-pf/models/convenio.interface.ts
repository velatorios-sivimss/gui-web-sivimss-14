export interface Convenio {
  folioConvenio?: string | null;
  rfc?: string | null;
  numeroINE?: number | null;
  matriculaIMSS?: number | null;
  nombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  tipoPF?: number | null;
  descTipoPF?: string | null;
  tipoPaquete?: number | null;
  descTipoPaquete?: string | null;
  estatusConvenio?: boolean | null;
  cuotaRecuperacion?: number | null;
  fechaInicioVigencia?: string | null;
  fechaFinVigencia?: string | null;
  calle?: string | null;
  numeroInterior?: string | null;
  numeroExterior?: string | null;
  cp?: number | null;
  estado?: number | null;
  descEstado?: string | null;
  municipio?: string | null;
  telefonoContacto?: number | null;
  correoElectronico?: string | null;
  beneficiarios?: number | null;
  datosBancarios?: string | null;
  velatorio?: string | null;
  fecha?: string | null;
}

export interface BusquedaConvenio {
  estado?: string;
  costoRenovacion?: number;
  indRenovacion?: number;
  segundoApellido?: string;
  estatusConvenio?: number;
  nomContratante?: string;
  tipoPrevision?: string;
  numInterior?: string;
  fecInicio?: string;
  correo?: string;
  idTipoPrevision?: number;
  tel?: string;
  fecVigencia?: string;
  numExterior?: string;
  primerApellido?: string;
  municipio?: string;
  calle?: string;
  idPaquete?: number;
  cp?: number;
  rfc?: string;
  beneficiarios?: Beneficiario[];
  tipoPaquete?: string;
  folio?: string;
  matricula?: string;
  idConvenio?: number;
  velatorio?: string | null;
  fecha?: string | null;
  datosBancarios?: string | null;
  tipoConvenioDesc?: string | null;
}

export interface Beneficiario {
  idBeneficiario?: number;
  idPersona?: number;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  edad?: string;
  parentesco?: string;
  curp?: string;
  rfc?: string;
  actaNacimiento?: string;
  email?: string;
  telefono?: string;
}

export interface BuscarConvenioPlanAnterior {
  numeroConvenio?: string;
  numeroContratante?: string;
}

export interface BuscarConvenioPlanNuevo {
  folio?: string;
  rfc?: string;
}

export interface RenovarDoc {
  convenioAnterior?: number | null;
  cartaPoder?: number | null;
  ineTestigo?: number | null;
  ineTestigoDos?: number | null;
}

export interface ObtenerCatalogo {
  idCatalogo?: number;
  idConvenio?: number | null;
}

export interface CatalogoDatosGenerales {
  idValidacionDoc?: number;
  rfcAfiliado?: boolean;
  velatorio?: string;
  contratante?: string;
  ineAfiliado?: boolean;
  curpAfiliado?: boolean;
  fecha?: string;
}

export interface VerificarDocumentacion {
  idValidacionDoc?: number;
  ineAfiliado?: number | null;
  curp?: number | null;
  rfc?: number | null;
  renovarDoc?: RenovarDoc;
}

export interface RenovarPlan {
  datosBancarios?: string | null;
  idConvenioPf?: number | null;
  folio?: string | null;
  vigencia?: string | null;
  indRenovacion?: number | null;
}

export interface ReporteConvenioPlanNuevo {
  folio?: string;
  rutaNombreReporte?: string;
  tipoReporte?: string;
}

export interface ReporteConvenioPlanAnterior {
  idConvenio?: number;
  costoRenovacion?: number;
  rutaNombreReporte?: string;
  tipoReporte?: string;
}

export interface ReporteAnexoDiez {
  idConvenio?: string;
  rutaNombreReporte?: string;
  tipoReporte?: string;
}

export interface BeneficiarioContratante {
  idContratanteConvenioPf?: number;
  idParentesco?: number;
  indActa?: number;
  indIne?: number;
}

export interface DocPlanAnterior {
  indComprobanteEstudios?: number;
  indActaMatrimonio?: number;
  indDeclaracionConcubinato?: number;
}

export interface GuardarBeneficiario {
  nombre?: string;
  apellidoP?: string;
  apellidoM?: string;
  fechaNac?: string;
  curp?: string;
  rfc?: string;
  correoE?: string;
  tel?: string;
  beneficiario?: BeneficiarioContratante;
  docPlanAnterior?: DocPlanAnterior;
}

export interface ActualizarBeneficiario {
  idBeneficiario?: number;
  idPersona?: number;
  nombre?: string;
  apellidoP?: string;
  apellidoM?: string;
  fechaNac?: string;
  curp?: string;
  rfc?: string;
  correoE?: string;
  tel?: string;
  beneficiario?: BeneficiarioContratante;
  docPlanAnterior?: DocPlanAnterior;
}

export interface CambiarEstatus {
  idBeneficiario?: number;
  estatusBenefic?: boolean;
}