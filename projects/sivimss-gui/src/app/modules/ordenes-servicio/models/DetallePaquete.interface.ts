import { ServicioDetalleTrasladotoInterface } from './ServicioDetalleTraslado.interface';

export interface DetallePaqueteInterface {
  idArticulo: number | null;
  idServicio: number | null;
  idTipoServicio: number | null;
  desmotivo: string | null;
  activo: number | null;
  cantidad: number | null;
  idProveedor: number | null;
  importeMonto: number | null;
  totalPaquete: number | null;
  idCategoriaPaquete: number | null;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface | null;
}
