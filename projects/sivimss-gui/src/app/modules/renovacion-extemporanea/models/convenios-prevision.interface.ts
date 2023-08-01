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
}

export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}

export interface RenovarConvenio {
  idConvenio?: number;
  justificacion?: string;
  indRenovacion?: number;
}

export interface BuscarConveniosPrevision {
  idVelatorio?: number | null;
  idDelegacion?: number | null;
  numConvenio?: string | null;
  folio?: string | null;
  rfc?: string | null;
}