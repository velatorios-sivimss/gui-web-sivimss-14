export interface ConveniosPrevision {
  id?: number;
  folioConvenio?: string;
  rfc?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  velatorioOrigen?: string;
  tipoPrevencionFuneraria?: string;
  tipoPaquete?: string;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
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