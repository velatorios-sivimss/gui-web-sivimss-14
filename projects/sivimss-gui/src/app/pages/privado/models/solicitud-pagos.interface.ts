export interface SolicitudPagos {
  idRegistro: number | null,
  idFlujoPagos: number,
  idVelatorio: number | null,
  folio: string,
  importe: number,
  nomTitular: string,
  numTarjeta: string,
  referencia: string,
  numAprobacion: string,
  folioPago: string,
  fecTransaccion: string,
  nomContratante: string,
  idMetodoPago: number
}
