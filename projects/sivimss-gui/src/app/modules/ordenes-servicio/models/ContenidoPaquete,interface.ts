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
  idArticulo?: number;
  idInventario?: number;
  kilometraje?: number;
  coordOrigen?: any[];
  coordDestino?: any[];
  idAsignacion?: number | null;
  utilizarArticulo?: boolean;
  provinene?: string | null;
  bloquearRadioButton?: boolean | null;
}
