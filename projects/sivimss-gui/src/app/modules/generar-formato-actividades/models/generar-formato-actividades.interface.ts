export interface GenerarFormatoActividades {
  idFormato?: number;
  idVelatorio?: number;
  fecInicio?: string;
  fecFin?: string;
  actividades?: Actividades;
}

export interface Actividades {
  idActividad?: number;
  fecActividad?: string;
  hrInicio?: string;
  hrFin?: string;
  idPromotor?: number;
  numPlaticas?: number;
  unidad?: string;
  empresa?: string;
  actividadRealizada?: string;
  observaciones?: string;
  evidencia?: number;
}

export interface GenerarFormatoActividadesBusqueda {
  idFormato?: number;
  fecha?: string;
  folio?: string;
  velatorio?: string;
  numActividaes?: string;
  horarioInicial?: string;
  horarioFinal?: string;
  personalVelatorio?: string;
  puesto?: string;
  numPlaticas?: string;
  unidadImss?: string;
  empresa?: string;
  actividadRealizada?: string;
}

export interface BuscarGenerarFormatoActividades {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  folio?: string | null;
  fecInicio?: string | null;
  fecFin?: string | null;
}

export interface BuscarCatalogo {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  nomPromotor?: string | null;
  catalogo?: number | null;
}