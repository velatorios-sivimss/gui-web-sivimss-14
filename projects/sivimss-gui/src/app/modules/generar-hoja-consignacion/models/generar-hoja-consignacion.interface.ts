export interface GenerarHojaConsignacion {
  idFormatoRegistro?: number;
  idVelatorio?: number;
  fecInicio?: string;
  fecFin?: string;
  actividades?: Actividades;
}

export interface Actividades {
  idActividad?: number | null;
  fecActividad?: string | null;
  hrInicio?: string | null;
  hrFin?: string | null;
  idPromotor?: number | null;
  numPlaticas?: number | null;
  unidad?: string | null;
  empresa?: string | null;
  actividadRealizada?: string | null;
  observaciones?: string | null;
  evidencia?: boolean | null;
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