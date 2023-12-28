import {MetodoPago} from "./detallePago.interface";

export interface DatosRegistroPago {
  idPagoBitacora: number,
  idFlujoPago: number,
  idRegistro: number,
  importePago: number
}

interface DatosRegistro {
  idPagoBitacora?: number,
  idFlujoPago?: number,
  idRegistro?: number,
}

export interface RegistroModal {
  tipoPago: string,
  idPago: string,
  total: number,
  datosRegistro: DatosRegistro
}

export interface ParametrosModificar {
  metodoPago: string,
  tipoPago: string,
  importe: number,
  idPagoDetalle: number,
  total: number
}

export interface ParametrosEliminar {
  pago: MetodoPago,
  total: number
}
