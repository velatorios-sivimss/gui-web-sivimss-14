export interface SolicitudCrearPago {
  idPagoBitacora: number,
  idMetodoPago: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number,
  numAutorizacion: number,
  descBanco: string,
  fechaPago: string | null,
  fechaValeAGF: string | null,
  importeRegistro: number
}



