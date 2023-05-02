export interface ConsultaDonacionesInterface {
  velatorio?: string;
  tipo?: string;
  modeloAtaud?: string;
  numInventario?: number;
  fecDonacion?: string;
  donadoPor?: string;
  nomDonador?: string;
}

export interface AtaudDonado {
  idAtaud?: number;
  descAtaud?: string;
  modelo?: string;
  material?: string;
  noInventario?: string;
}

// export interface RespuestaAtaud {
//   ataud?: AtaudDonado,
//   estatus?: boolean
// }

export interface FinadoInterface {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
}

export interface RespuestaFinado {
  finado?: FinadoInterface,
  estatus?: boolean;
}

export interface FiltroDonacionesInterface {
  idVelatorio?: number;
  idDelegacion?: number;
  idNivel?: number;
  fechaInicio?: string;
  fechaFin?: string;
  donadoPor?: string;
  tipoReporte?: string
}

