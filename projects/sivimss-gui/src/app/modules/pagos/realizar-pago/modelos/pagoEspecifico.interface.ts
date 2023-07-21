export interface PagoEspecifico {
  diferenciasTotales: number,
  fechaPago: string,
  folio: string
  idPagoBitacora: number
  tipoPago: string
  total: number
  totalPagado: number,
  idFlujoPago: number,
  idRegistro: number,
  estatusPago?: string,
  generarPagare?: number
}
