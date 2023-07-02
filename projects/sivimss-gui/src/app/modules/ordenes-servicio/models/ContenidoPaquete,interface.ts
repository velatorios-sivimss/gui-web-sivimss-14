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
}
