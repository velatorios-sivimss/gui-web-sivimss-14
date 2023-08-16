export interface BalanceCaja {
  fecha: number;
  delegacion: string;
  velatorio: string,
  folio: string;
  tipoIngreso: string;
  metodo: string;
  estatus: string;
}

export interface ModificarPagoInterface {
  modificarPago?: string;
}