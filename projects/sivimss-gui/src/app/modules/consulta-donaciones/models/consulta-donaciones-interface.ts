export interface ConsultaDonacionesInterface {
  velatorio?: string;
  tipoMaterial?: string;
  modeloAtaud?: string;
  numInventario?: number;
  fecDonacion?: string;
  donadoPor?: string;
  nomDonador?: string;
}

export interface AtaudDonado {
  idInventarioArticulo?: number;
  // idAtaud?: number;
  idArticulo?: number;
  noInventario?: string;
  folioArticulo?: string;
  material?: string;
  desTipoMaterial?: string;
  modelo?: string;
  desModeloArticulo?: string
  descAtaud?: string;
}

export interface ConsultaAtaudesDonados {
  folio: string;
  ataudes?: AtaudDonado[]
}

export interface FinadoInterface {
  nomFinado?: string;
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

export interface GuardarAgregarDonacion {
  idOrdenServicio?: number;
  responsableAlmacen?: string;
  matricularesponsable?: string;
  numTotalAtaudes?: number;
  ataudesDonados?: [
    {
      idArticulo?: number,
      folioArticulo?: string
    }
  ];
}

