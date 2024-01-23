export interface SeguimientoNuevoConvenio {
  id?: number;
  nivel?: string;
  velatorio?: string;
  folioConvenioPf?: string;
  idConvenioPlan?: number;
  folioConvenioPsfpa?: string;
  rfcAfiliado?: string;
  tipoContratacion?: string;
  rfc?: string;
  nombreAfiliado?: string;
  tipoPaquete?: string;
  estatus?: boolean;
  tipo?: string;
}

export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}


