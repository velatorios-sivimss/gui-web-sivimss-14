export interface DetallePago {
  idRegistro: number;
  idFlujoPago: number;
  idPagoBitacora: number;
  folio: string,
  metodosPago: MetodoPago[],
  totalAPagar: number
  totalPagado: number
  totalPorCubrir: number,
  estatusPago: string,
  tipoPago: string,
  fechaUltimaPago: string
}

export interface MetodoPago {
  fechaPago: string
  idPagoDetalle: number
  importe: number
  metodoPago: string
  nomBanco: string
  numAutorizacion: string
}
