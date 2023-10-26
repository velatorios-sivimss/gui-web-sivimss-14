export interface NotaRemision {
  id: number;
  idNota: number;
  fechaODS?: string;
  nomFinado?: string;
  idContratante?: number;
  idFinado?: number;
  estatus?: number;
  conNota?: number;
  folioODS?: string;
  nomContratante?: string;
  motivo?: string;
  total: number;
}

export type ClavesEstatus = {
  [key: number]: string;
};

export interface ConsultaNotaRemision {
  idNota: number | null;
  idOrden: number | null;
}

export interface DetalleNotaRemision {
  versionDocumento?: string;
  fechaNota?: string;
  velatorioOrigen?: string;
  folioNota?: string;
  nomFinado?: string;
  dirVelatorio?: string;
  parFinado?: string;
  curpSolicitante?: string;
  folioODS?: string;
  nomVelatorio?: string;
  nomSolicitante?: string;
  dirSolicitante?: string;
  nombreConformidad?: string;
  nombreRepresentante?: string;
  folioConvenio?: string;
  fechaConvenio?: string;
  motivo?: string;
  fechaODS: string;
}

export interface ArticulosServicios {
  nomPaquete?: string;
  cantidad?: number;
  nomServicio?: string;
}

export interface GenerarReporte {
  idNota: number;
  idOrden: number;
  tipoReporte: string;
}

export interface GenerarDatosReporte {
  idNota?: number;
  idOrden?: number;
  fechaNota?: string;
  nomVelatorio?: string;
  folioNota?: string;
  dirVelatorio?: string;
  nomSolicitante?: string;
  dirSolicitante?: string;
  curpSolicitante?: string;
  velatorioOrigen?: string;
  nomFinado?: string;
  parFinado?: string;
  folioODS?: string;
  folioConvenio?: string;
  fechaConvenio?: string;
  tipoReporte?: string;
  fechaODS?: string;
}

export interface BusquedaFiltro {
  idNivel: number | null;
  idVelatorio: number | null;
  idDelegacion: number | null;
  folioODS: string | null;
  fecIniODS: string | null;
  fecFinODS: string | null;
  tipoReporte?: string;
}

export interface FiltrosBasicos {
  nivel: number,
  velatorio: number | null,
  delegacion: number | null
}

export interface SolicitudDescarga {
  idNivel: number | null;
  idDelegacion: number | null;
  idVelatorio: number | null;
  tipoReporte: 'pdf' | 'xls';
  folioODS?: string | null;
  fecIniODS?: string | null;
  fecFinODS?: string | null;
}
