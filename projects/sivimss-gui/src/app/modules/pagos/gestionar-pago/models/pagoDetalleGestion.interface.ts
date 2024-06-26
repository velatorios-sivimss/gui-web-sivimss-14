import {MetodoPagoGestion} from "./metodoPagoGestion.interface";

export interface PagoDetalleGestion {
  montoTotal: number;
  fecha: string,
  folio: string,
  nomContratante: string,
  idFlujo: number,
  desFlujo: string,
  fecPago: string,
  desEstatus: string,
  desEstatusPago: string,
  idPagoBitacora: number,
  metodosPago: MetodoPagoGestion[]
}
