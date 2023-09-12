export interface GenerarFormatoActividades {
  idFormato?: number;
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

export interface GenerarFormatoActividadesBusqueda {
  idFormato?: number | null;
  idActividad?: number | null;
  fecha?: string | null;
  folio?: string | null;
  velatorio?: string | null;
  numActividaes?: string | null;
  horarioInicial?: string | null;
  horarioFinal?: string | null;
  personalVelatorio?: number | null;
  puesto?: number | null;
  numPlaticas?: number | null;
  unidadImss?: string | null;
  empresa?: string | null;
  actividadRealizada?: string | null;
  observaciones?: string | null;
  evidencia?: boolean | null;
}

export interface BuscarGenerarFormatoActividades {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  folio?: string | null;
  fecInicio?: string | null;
  fecFin?: string | null;
}

export interface BuscarCatalogo {
  catalogo?: number | null;
  idCatalogo?: number | null;
  idVelatorio?: number | null;
}