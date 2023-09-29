export interface FiltrosBalanceCaja {
  idNivel?: number | null,
  idDelegacion: number | null,
  idVelatorio: number | null,
  idTipoConvenio: number | null,
  folioODS: string,
  folioNuevoConvenio: string,
  folioRenovacionConvenio: string,
  fecha: string | null,
  idMetodoPago: string | null,
  tipoReporte?: string,
}
