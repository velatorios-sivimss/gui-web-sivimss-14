export interface NotaRemision {
  id?: number;
  fechaODS?: string;
  nomFinado?: string;
  idContratante?: number;
  idFinado?: number;
  estatus?: number,
  conNota?: number;
  folioODS?: string;
  nomContratante?: string;
}

export type ClavesEstatus = {
  [key: number]: string;
};

export interface ConsultaNotaRemision {
  idNota: number;
  idOrden: number;
}