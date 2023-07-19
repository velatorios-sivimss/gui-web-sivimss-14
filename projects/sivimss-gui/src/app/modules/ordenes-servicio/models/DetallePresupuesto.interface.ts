import { ServicioDetalleTrasladotoInterface } from './ServicioDetalleTraslado.interface';

export interface DetallePresupuestoInterface {
  proviene: string | null;
  idCategoria: number | null;
  idArticulo: number | null;
  idInventario: number | null;
  idTipoServicio: number | null;
  idServicio: number | null;
  cantidad: number | null;
  idProveedor: number | null;
  esDonado: number | null;
  importeMonto: number | null;
  activo?: number | null;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface | null;
}
