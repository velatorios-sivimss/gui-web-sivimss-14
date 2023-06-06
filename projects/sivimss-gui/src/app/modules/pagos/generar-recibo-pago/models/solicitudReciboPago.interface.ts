export interface SolicitudReciboPago {
  numFolio: string,
  idDelegacion: number,
  idVelatorio: number,
  idPagoDetalle: number,
  fecReciboPago: string,
  nomContratante: string,
  canReciboPago: string,
  canTramites: string,
  descTramites: unknown,
  canDerechos: string,
  descDerechos: unknown,
  canSuma: string,
  canTotal: string,
  agenteFuneMat: string,
  recibeMat: string
}
