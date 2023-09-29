export interface ConveniosPrevision {
  idConvenio?: number;
  folio?: string;
  rfc?: string;
  matricula?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  velatorio?: string;
  tipoPrevision?: number;
  idEstatus?: number;
  tipoPaquete?: string;
  cuotaRecuperacion?: number;
  fecInicio?: string;
  fecVigencia?: string;
  correo?: string;
  indRenovacion?: number;
  tel?: string;
  beneficiarios?: Beneficiarios[];
}

export interface Beneficiarios {
  activo?: boolean;
  id?: number;
  idpersona?: number;
  nombreBeneficiario?: string;
}

export interface BusquedaConveniosPrevision {
  idConvenio?: number;
  folio?: string;
  rfc?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  velatorio?: string;
  tipoPrevision?: number;
  tipopaquete?: string;
  fecInicio?: string;
  fecVigencia?: string;
  numeroINE?: string;
  beneficiarios?: string;
  telefonoContacto?: string;
  correoElectronico?: string;
  cuotaRecuperacion?: string;
  estatus?: boolean;
  matriculaIMSS?: string;
  fallecido?: boolean;
}

export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}

export interface GenerarRenovacionConvenio {
  idConvenio?: number;
  justificacion?: string;
  indRenovacion?: number;
}

export interface FiltrosConveniosPrevision {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  numConvenio?: number | null;
  folio?: string | null;
  rfc?: string | null;
}