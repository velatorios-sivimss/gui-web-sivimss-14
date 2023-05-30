export interface AgregarSalidaDonacionInterface{
  rfc?: string;
  curp?: string;
  nss?: string |null;
  nomPersona?: string;
  nomPersonaPaterno?: string;
  nomPersonaMaterno?: string;
  numSexo?: number;
  idPais?: number;
  idEstado?: number;
  desTelefono?: string;
  desCorreo?: string;
  tipoPersona?: string;
  claveMatricula?: string;
  desCodigoPostal?: number;
  desEstado?: string;
  desMunicipio?: string;
  desCalle?: string;
  numExterior?: string;
  numInterior?: string;
  desColonia?: string;
  nomInstitucion?: string;
  fecNacimiento?: string;
  numTotalAtaudes?: number,
  estudioSocieconomico?: number;
  estudioLibre?: number,
  fecSolicitad?: string;
  responsableAlmacen?: string;
  matricularesponsable?: string;
  ataudesDonados?: AtaudesDonados[],
  agregarFinados?: Finado[] | string,
}

export interface AtaudesDonados {
  idArticulo?: number;
  folioArticulo?: string;
}

export interface  Finado {
  nomFinado?:string;
  nomFinadoPaterno?:string;
  nomFinadoMaterno?: string;
}
