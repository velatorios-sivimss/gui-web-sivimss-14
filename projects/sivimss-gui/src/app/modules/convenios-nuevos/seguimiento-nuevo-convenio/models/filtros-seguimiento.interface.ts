export interface FiltrosBasicosNuevoConvenio {
  idVelatorio: number | null
}

export interface FiltrosNuevoConvenio {
  idVelatorio: number | null,
  convenioPF: string,
  convenioPSFPA: string,
  rfc: string
}

export interface DefaultNuevoConvenio {
  velatorio: number | null,
  nivel: number | null,
}
