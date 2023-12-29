export interface FiltrosPago {
  idVelatorio: number,
  folio: string | null,
  nomContratante: string,
  fechaInicio: string | null,
  fechaFin: string | null,
  idFlujoPagos: number | null;
}

export interface FiltroBasico {
  idVelatorio: number | null
}
