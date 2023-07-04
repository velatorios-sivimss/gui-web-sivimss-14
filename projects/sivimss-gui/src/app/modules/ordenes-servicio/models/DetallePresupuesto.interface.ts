import { ServicioDetalleTrasladotoInterface } from './ServicioDetalleTraslado.interface';

export interface DetallePresupuestoInterface {
  idCategoria: number | null;
  idArticulo: number | null;
  idInventario: number | null;
  idTipoServicio: number | null;
  idServicio: number | null;
  cantidad: number | null;
  idProveedor: number | null;
  esDonado: number | null;
  importeMonto: number | null;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface | null;
}
