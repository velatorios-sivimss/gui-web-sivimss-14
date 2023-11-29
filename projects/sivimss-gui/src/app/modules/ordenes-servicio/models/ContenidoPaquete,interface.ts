export interface ContenidoPaqueteInterface {
  grupo: string;
  concepto: string;
  totalPaquete: number;
  idServicio: string;
  cantidad: string;
  idCategoria: string;
  importe: string;
  idTipoServicio: string;
  utilizarServicio?: number;
  idProveedor: number | null;
  proveedor?: string | null;
  fila?: number;
  idArticulo?: number | null;
  idInventario?: number | null;
  kilometraje?: number;
  coordOrigen?: any[];
  coordDestino?: any[];
  idAsignacion?: number | null;
  utilizarArticulo?: boolean | string;
  provinene?: string | null;
  bloquearRadioButton?: boolean | null;
}
