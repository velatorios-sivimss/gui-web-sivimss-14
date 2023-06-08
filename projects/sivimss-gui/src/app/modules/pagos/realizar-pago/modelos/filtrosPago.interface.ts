export interface FiltrosPago {
  idVelatorio: number,
  claveFolio: string,
  nomContratante: string,
  fechaInicio: string,
  fechaFin: string,
  idFlujoPago: number | null;
}
