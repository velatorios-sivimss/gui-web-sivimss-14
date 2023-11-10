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
}
