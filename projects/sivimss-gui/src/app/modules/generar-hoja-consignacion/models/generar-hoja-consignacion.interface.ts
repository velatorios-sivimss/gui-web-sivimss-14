export interface ArticulosBusqueda {
  totalCosto?: number | null;
  totalArt?: number | null;
  artResponse: ArticulosBusquedaDetalle[];
}

export interface ArticulosBusquedaDetalle {
  idArticulo?: number | null;
  idOds?: number | null;
  idPaquete?: number | null;
  folioOds?: string | null;
  fecOds?: string | null;
  folioOde?: string | null;
  costoUnitario?: number | null;
  costoConIva?: string;
  categoria?: string | null;
  proveedor?: string | null;
  paquete?: string | null;
}

export interface HojaConsignacionDetalle {
  totalCosto?: string;
  totalArt?: number;
  folio?: string;
  folioFiscal?: string;
  velatorio?: string;
  delegacion?: string;
  fecElaboracion?: string;
  hrElaboracion?: string;
  artResponse: ArticulosBusquedaDetalle[];
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
  idHojaConsig?: number | null;
  fecElaboracion?: string | null;
  folio?: string | null;
  proveedor?: string | null;
  folioFiscal?: string | null;
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