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
  beneficiarios?: BusquedaBeneficiarios[];
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
  idBeneficiario?: number | null;
  idPersona?: number | null;
  nombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  edad?: string | null;
  parentesco?: string | null;
  curp?: string;
  rfc?: string | null;
  email?: string | null;
  telefono?: string | null;
  tipoConvenioDesc?: string | null;
  actaNacimiento?: boolean | null;
  ineBeneficiario?: boolean | null;
  comprobanteEstudios?: boolean | null;
  actaMatrimonio?: boolean | null;
  declaracionConcubinato?: boolean | null;
}

export interface BeneficiarioSeleccionado {
  primerApellido?: string | null;
  indIne?: boolean | null;
  segundoApellido?: string | null;
  declaracionConcubinato?: boolean | null;
  nombre?: string | null;
  edad?: number | null;
  indActa?: boolean | null;
  rfc?: string | null;
  estatus?: boolean | null;
  idBenef?: number;
  parentesco?: string | null;
  idParentesco?: number | null;
  comprobEstudios?: boolean | null;
  correo?: string | null;
  tel?: string | null;
  actaMatrimonio?: boolean | null;
  idConvenio?: number | null;
  curp?: string;
  idPersona?: number | null;
  tipoConvenioDesc?: string | null;
}

export interface BusquedaBeneficiarios {
  id?: number;
  idpersona?: number;
  nombreBeneficiario?: string;
}
export interface BusquedaListBeneficiarios {
  idConvenio?: number;
  idContratanteConvenioPf?: number;
  beneficiarios?: BusquedaBeneficiarios[];
  activos?: number;
  tipoPlan?: number;
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
  idParentesco?: number | null;
  indActa?: number | null;
  indIne?: number | null;
}

export interface DocPlanAnterior {
  indComprobanteEstudios?: number | null;
  indActaMatrimonio?: number | null;
  indDeclaracionConcubinato?: number | null;
}

export interface GuardarBeneficiario {
  nombre?: string | null;
  apellidoP?: string | null;
  apellidoM?: string | null;
  fechaNac?: string | null;
  curp?: string;
  rfc?: string | null;
  correoE?: string | null;
  tel?: string | null;
  beneficiario?: BeneficiarioContratante;
  docPlanAnterior?: DocPlanAnterior;
}

export interface ActualizarBeneficiario {
  idBeneficiario?: number | null;
  idPersona?: number | null;
  nombre?: string | null;
  apellidoP?: string | null;
  apellidoM?: string | null;
  fechaNac?: string | null;
  curp?: string;
  rfc?: string | null;
  correoE?: string | null;
  tel?: string | null;
  beneficiario?: BeneficiarioContratante;
  docPlanAnterior?: DocPlanAnterior;
}

export interface CambiarEstatus {
  idBeneficiario?: number;
  estatusBenefic?: boolean;
  idContratanteConvenio?: number;
}