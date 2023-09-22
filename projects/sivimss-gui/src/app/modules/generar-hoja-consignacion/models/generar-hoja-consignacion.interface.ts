export interface ArticulosBusqueda {
  totalCosto?: number | null;
  totalArt?: number | null;
  articulosBusquedaDetalle: ArticulosBusquedaDetalle[];
}

export interface ArticulosBusquedaDetalle {
  idArticulo?: number | null;
  idOds?: number | null;
  idPaquete?: number | null;
  folioOds?: string | null;
  fecOds?: string | null;
  folioOde?: string | null;
  costoUnitario?: number | null;
  costoConIva?: number | null;
  categoria?: string | null;
  proveedor?: string | null;
  paquete?: string | null;

}
export interface GenerarHoja {
  idVelatorio?: any;
  idProveedor?: any;
  artConsig?: ArticulosConsignacion[];
}

export interface ArticulosConsignacion {
  idArticulo?: number | null;
  idOds?: number | null;
  idPaquete?: number | null;
  folioOds?: string | null;
  fecOds?: string | null;
  folioOde?: string | null;
  costoUnitario?: number | null;
  costoConIva?: number | null;
  categoria?: string | null;
  proveedor?: string | null;
  paquete?: string | null;
}

export interface GenerarHojaConsignacion {

}

export interface BuscarProveedor {
  idDelegacion?: any;
  idVelatorio?: any;
  idProveedor?: any;
  fecInicio?: string | null;
  fecFin?: string | null;
}

export interface BuscarGenerarHojaConsignacion {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  folio?: string | null;
  idProveedor?: number | null;
  fecInicio?: string | null;
  fecFin?: string | null;
}

export interface GenerarHojaConsignacionBusqueda {
  idHojaConsignacion?: number | null;
  fecHojaConsignacion?: string | null;
  folioHojaConsignacion?: string | null;
  proveedor?: string | null;
}

export interface BuscarCatalogo {
  catalogo?: number | null;
  idCatalogo?: number | null;
  idVelatorio?: number | null;
}

export interface AdjuntarFactura {
  idHojaConsig: number | null;
  folioFiscal: string | null;
  costoFactura: number | null;
}