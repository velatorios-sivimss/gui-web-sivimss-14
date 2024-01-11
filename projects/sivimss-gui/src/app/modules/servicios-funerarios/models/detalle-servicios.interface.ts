export interface DetalleServicios {
  idPlan: null | string;
  costoRestante: null | string;
  precio: null | string;
  estado: null | string;
  correo: null | string;
  folio: null | string;
  nombre: null | string;
  paquete: null | string;
  importePagado: null | string;
}

export interface PagosRealizados {
  estatusPago: null | string;
  idPagoSFPA: null | string;
  importeAcumulado: null | string;
  noPagos: null | string;
  velatorio: null | string;
  validaPago: null | boolean;
  idPlanSFPA: null | string;
  fechaParcialidad: null | number;
  importeMensual: null | string;
  importePagado: null | string;
  idEstatus: null | string;
  metodoPago: null | string;
  reciboPago: null | string;
  realizarPago: null | string;
}

export interface PagosBitacora {
  numeroPago: null | string;
  numeroAutorizacion: null | string;
  numeroValeParitario: null | string;
  idBitacora: null | string;
  importePago: null | string;
  fechaPago: null | string;
  desMetodoPago: null | string;
  estatus: null | string;
  importeValeParitario: null | string;
  folioAutorizacion: null | string;
  fechaValeParitario: null | string;
  referenciaBancaria: null | string;
  idMetodoPago: null | string;
  idEstatus: null | number;
}
