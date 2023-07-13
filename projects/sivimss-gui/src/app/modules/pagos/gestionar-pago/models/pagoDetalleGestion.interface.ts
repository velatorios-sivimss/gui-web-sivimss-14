export interface PagoDetalleGestion {
  fecha: string,
  folio: string,
  nomContratante: string,
  idFlujo: number,
  desFlujo: string,
  fecPago: string,
  desEstatus: string,
  desEstatusPago: string,
  idPagoBitacora: number,
  metodosPago: [
    {
      "desBanco": "Banco BanBajio",
      "desMetodoPago": "Tarjeta débito",
      "fecPago": "13/07/2023",
      "numAutorizacion": "00000285",
      "idPagoDetalle": 31,
      "importe": 2000.0,
      "idMetodoPago": 4
    }
  ]
}
