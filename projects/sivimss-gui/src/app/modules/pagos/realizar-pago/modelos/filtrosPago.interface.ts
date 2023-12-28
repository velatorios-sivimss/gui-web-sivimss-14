export interface FiltrosPago {
  idVelatorio: number,
  folio: string | null,
  nomContratante: string,
  fechaInicio: string,
  fechaFin: string,
  idFlujoPagos: number | null;
}

export interface FiltroBasico {
  nivel: number,
  velatorio: number | null
}
