export interface FiltrosPago {
  idVelatorio: number,
  folio: string,
  nomContratante: string,
  fechaInicio: string,
  fechaFin: string,
  idFlujoPagos: number | null;
}
